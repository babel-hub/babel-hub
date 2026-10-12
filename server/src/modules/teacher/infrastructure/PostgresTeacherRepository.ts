import type {
    ITeacherRepository,
    GetTeachersPayload
} from "../domain/ITeacherRepository.js";
import type { CreateTeacher, TeacherRow, Teachers } from "../domain/Teacher.types.js";
import type { AuthUser, TeacherCreateCredentials, TeacherUpdateCredentials } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { supabase } from "../../../services/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import {pgUniqueMessage} from "../../shared/db/pgErrors.js";

export class PostgresTeacherRepository implements ITeacherRepository {

    async getTeachers(payload: GetTeachersPayload, authUser: AuthUser): Promise<Teachers[]> {
        const { available, includeTeacherId, isActive } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            let queryText = `
                SELECT
                    t.id,
                    p.first_name as teacher_first_name,
                    p.middle_name as teacher_middle_name,
                    p.first_last_name as teacher_first_last_name,
                    p.second_last_name as teacher_second_last_name,
                    p.is_active,
                    p.email,
                    p.created_at,
                    COUNT(DISTINCT cl.id)::int AS total_classes
                FROM teacher t
                         JOIN profile p ON t.profile_id = p.id
                         LEFT JOIN class cl ON cl.teacher_id = t.id
            `;

            const values: any[] = [userSchoolId, isActive];
            const whereClauses: string[] = ['p.school_id = $1', 'p.is_active = $2'];

            if (available === 'true') {
                queryText += ` LEFT JOIN course co ON t.id = co.teacher_id `;

                if (includeTeacherId) {
                    values.push(includeTeacherId);
                    whereClauses.push(`(co.id IS NULL OR t.id = $${values.length})`);
                } else {
                    whereClauses.push(`co.id IS NULL`);
                }
            }

            queryText += ` WHERE ${whereClauses.join(' AND ')} `;

            queryText += `
                GROUP BY
                    t.id, p.first_name, p.middle_name, p.first_last_name,
                    p.second_last_name, p.is_active, p.email, p.created_at
                ORDER BY p.first_last_name ASC;
            `;

            const result = await client.query(queryText, values);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getTeacherDetails(teacherId: string, authUser: AuthUser): Promise<TeacherRow | null> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const teacher = await client.query<TeacherRow>(`
                SELECT
                    t.id as teacher_id,
                    p.first_name as teacher_first_name,
                    p.middle_name as teacher_middle_name,
                    p.first_last_name as teacher_first_last_name,
                    p.second_last_name as teacher_second_last_name,
                    p.email,
                    p.is_active,
                    p.created_at
                FROM teacher t
                         JOIN profile p ON t.profile_id = p.id
                WHERE t.id = $1 AND p.school_id = $2
            `, [teacherId, userSchoolId]);

            if (teacher.rowCount === 0) return null;
            return teacher.rows[0]!;
        } finally {
            client.release();
        }
    }

    async createTeacher(credentials: TeacherCreateCredentials, authUser: AuthUser): Promise<CreateTeacher> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        let authUserId: string | null = null;
        try {
            await client.query('BEGIN');

            const { data, error } = await supabase.auth.admin.createUser({
                email: credentials.email,
                password: credentials.password,
                email_confirm: true
            });

            if (error) {
                if (error.code === 'email_exists') {
                    throw new ConflictError("Ya existe un usuario con la misma dirección de email");
                }
                throw new ValidationError(`No se pudo crear el usuario (${error.message})`);
            }

            authUserId = data.user?.id as string;

            const profile = await client.query(`
                INSERT INTO profile (
                    auth_profile_id, first_name, middle_name, first_last_name, second_last_name,
                    user_name, phone, role, email, school_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'teacher', $8, $9)
                    RETURNING id;
            `, [
                authUserId,
                credentials.firstName,
                credentials.middleName,
                credentials.firstLastName,
                credentials.secondLastName,
                credentials.userName,
                credentials.phone,
                credentials.email,
                userSchoolId
            ]);

            const profileId = profile.rows[0].id;

            const teacher = await client.query(
                `INSERT INTO teacher (profile_id) VALUES ($1) RETURNING id`,
                [profileId]
            );

            const teacherId = teacher.rows[0].id;

            await createAuditLog(client, {
                targetUserId: profileId,
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_TEACHER",
                schoolId: userSchoolId,
                metadata: {
                    name: [
                        credentials.firstName,
                        credentials.middleName ?? "",
                        credentials.firstLastName,
                        credentials.secondLastName ?? ""
                    ].join(" "),
                    email: credentials.email
                }
            });

            await client.query('COMMIT');

            return { id: teacherId };
        } catch (error: any) {
            let rolledBack = true;
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                rolledBack = false;
                console.error('[CRITICAL] Rollback failed, DB state uncertain:', rollbackError);
            }

            if (authUserId && rolledBack) {
                try {
                    console.warn(`[Error]: Eliminando usuario huérfano de Supabase: ${authUserId}`);
                    await supabase.auth.admin.deleteUser(authUserId);
                } catch (cleanupError) {
                    console.error(`Failed to delete orphaned Supabase user ${authUserId}:`, cleanupError);
                }
            } else if (authUserId && !rolledBack) {
                console.error(`[CRITICAL] Uncertain state for authUserId=${authUserId}, profile may or may not exist. Manual reconciliation needed.`);
            }

            if (error.code === '23505') {
                throw new ConflictError(pgUniqueMessage(error.constraint));
            }

            if (error.code === '23503') {
                throw new ConflictError("Una referencia a otro registro es inválida");
            }

            throw error;
        } finally {
            client.release();
        }
    }

    async updateTeacher(credentials: TeacherUpdateCredentials, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const teacherCheck = await client.query(`
                SELECT t.profile_id
                FROM teacher t
                         JOIN profile p ON t.profile_id = p.id
                WHERE t.id = $1 AND p.school_id = $2
            `, [credentials.teacherId, userSchoolId]);

            if (teacherCheck.rowCount === 0) {
                throw new NotFoundError("No se encontró al maestro");
            }

            const teacherUserId = teacherCheck.rows[0].profile_id;

            await client.query(`
                UPDATE profile
                SET first_name = $1,
                    middle_name = $2,
                    first_last_name = $3,
                    second_last_name = $4,
                    user_name = $5,
                    phone = $6
                WHERE id = $7
            `, [
                credentials.firstName,
                credentials.middleName,
                credentials.firstLastName,
                credentials.secondLastName,
                credentials.userName,
                credentials.phone,
                teacherUserId
            ]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: 'UPDATE_TEACHER',
                targetUserId: teacherUserId,
                schoolId: userSchoolId,
                metadata: {
                    teacherId: credentials.teacherId,
                    name: [
                        credentials.firstName,
                        credentials.middleName ?? "",
                        credentials.firstLastName,
                        credentials.secondLastName ?? ""
                    ].join(" ")
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');

            if (error.code === '23505') {
                throw new ConflictError(pgUniqueMessage(error.constraint));
            }

            if (error.code === '23503') {
                throw new ConflictError("Una referencia a otro registro es inválida");
            }

            throw error;
        } finally {
            client.release();
        }
    }

    async deleteTeacher(teacherId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const teacher = await client.query(`
                SELECT
                    t.profile_id,
                    p.auth_profile_id,
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name
                FROM teacher t
                         JOIN profile p ON t.profile_id = p.id
                WHERE t.id = $1 AND p.school_id = $2
            `, [teacherId, userSchoolId]);

            if (teacher.rowCount === 0) throw new NotFoundError("No se encontró al maestro");

            const {
                profile_id,
                auth_profile_id,
                first_name,
                middle_name,
                first_last_name,
                second_last_name
            } = teacher.rows[0];

            await client.query(`DELETE FROM teacher WHERE id = $1`, [teacherId]);
            await client.query(`DELETE FROM profile WHERE id = $1`, [profile_id]);

            const { error } = await supabase.auth.admin.deleteUser(auth_profile_id);
            if (error) throw new ValidationError(`No se pudo eliminar el usuario (${error.message})`);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: 'DELETE_TEACHER',
                schoolId: userSchoolId,
                metadata: {
                    teacherId,
                    name: [first_name, middle_name ?? "", first_last_name, second_last_name ?? ""].join(" ")
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            let rolledBack = true;
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                rolledBack = false;
                console.error(`[CRITICAL] Rollback failed during teacher deletion, DB state uncertain:`, rollbackError);
            }

            if (!rolledBack) {
                console.error(`[CRITICAL] Uncertain state deleting teacher, profile_id may still exist while Supabase user was deleted. Manual reconciliation needed.`);
            }

            if (error.code === '23503') {
                throw new ConflictError("No se puede eliminar el maestro porque tiene clases o información guardada.");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}