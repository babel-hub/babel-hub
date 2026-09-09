import type { ITeacherRepository } from "../domain/ITeacherRepository.js";
import type { ClassRow, CreateTeacher, TeacherDetails, TeacherRow, Teachers } from "../domain/Teacher.types.js";
import { pool } from "../../../db/index.js";
import { supabase } from "../../../services/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser, TeacherCreateCredentials, TeacherUpdateCredentials } from "../../shared/domain/Shared.types.js";

export class PostgresTeacherRepository implements ITeacherRepository {
    async getTeachers(userSchoolId: string, available: string | undefined, includeTeacherId: string | undefined, isActive: boolean): Promise<Teachers[]> {
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
                    t.id, 
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name,
                    p.is_active,
                    p.email,
                    p.created_at
                ORDER BY p.first_last_name ASC;
            `;

            const result = await client.query(queryText, values);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getTeacherDetails(teacherId: string, userSchoolId: string): Promise<TeacherDetails | null> {
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

            const classes = await client.query<ClassRow>(`
                SELECT 
                    c.id as class_id,
                    s.name as subject_name,
                    co.name as course_name
                FROM class c
                JOIN subject s ON c.subject_id = s.id
                JOIN course co ON c.course_id = co.id
                WHERE c.teacher_id = $1
                ORDER BY co.name ASC
            `, [teacherId]);

            return {
                teacher: teacher.rows[0]!,
                classes: classes.rows
            }
        } finally {
            client.release();
        }
    }

    async createTeacher(teacherCredentials: TeacherCreateCredentials, authUser: AuthUser): Promise<CreateTeacher> {
        const client = await pool.connect();
        let authUserId: string | null = null;
        try {
            await client.query('BEGIN');

            const { data, error } = await supabase.auth.admin.createUser({
                email: teacherCredentials.email,
                password: teacherCredentials.password,
                email_confirm: true
            })

            if (error) {
                if (error.code === 'email_exists') {
                    throw new ConflictError("Ya existe un usuario con la misma dirección de email");
                }
                throw new ValidationError(`No se pudo crear el usuario (${error.message})`);
            }

            authUserId = data.user?.id as string;

            const profile = await client.query(`
                INSERT INTO profile (
                    auth_profile_id, first_name, middle_name, first_last_name, second_last_name, user_name, phone, role, email, school_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'teacher', $8, $9)
                    RETURNING id;
            `, [
                authUserId,
                teacherCredentials.firstName,
                teacherCredentials.middleName,
                teacherCredentials.firstLastName,
                teacherCredentials.secondLastName,
                teacherCredentials.userName,
                teacherCredentials.phone,
                teacherCredentials.email,
                authUser.userSchoolId
            ]);

            const profileId = profile.rows[0].id;

            const teacher = await client.query(`INSERT INTO teacher (profile_id) VALUES ($1) RETURNING id`, [profileId]);

            const teacherId = teacher.rows[0].id;

            await createAuditLog(client, {
                targetUserId: profileId,
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "CREATE_TEACHER",
                schoolId: authUser.userSchoolId,
                metadata: {
                    name: [
                        teacherCredentials.firstName,
                        teacherCredentials.middleName ?? "",
                        teacherCredentials.firstLastName,
                        teacherCredentials.secondLastName ?? ""
                    ].join(" "),
                    email: teacherCredentials.email
                }
            })

            await client.query('COMMIT');

            return { id: teacherId };
        } catch (error : any) {
            let rolledBack = true;
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                rolledBack = false;
                console.error('[CRITICAL] Rollback failed, DB state uncertain:', rollbackError);
            }

            if (authUserId && rolledBack) {
                console.warn(`[Error]: Eliminando usuario huérfano de Supabase: ${authUserId}`);
                await supabase.auth.admin.deleteUser(authUserId);
            } else if (authUserId && !rolledBack) {
                console.error(`[CRITICAL] Uncertain state for authUserId=${authUserId}, profile may or may not exist. Manual reconciliation needed.`);
            }

            throw error;
        } finally {
            client.release();
        }
    }

    async updateTeacher(teacherCredentials: TeacherUpdateCredentials, authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const teacherCheck = await client.query(`
                SELECT
                    t.profile_id
                FROM teacher t
                         JOIN profile p ON t.profile_id = p.id
                WHERE t.id = $1 AND p.school_id = $2
            `, [teacherCredentials.teacherId, authUser.userSchoolId]);

            if (teacherCheck.rowCount === 0) throw new NotFoundError("No se encontró al maestro");

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
                teacherCredentials.firstName,
                teacherCredentials.middleName,
                teacherCredentials.firstLastName,
                teacherCredentials.secondLastName,
                teacherCredentials.userName,
                teacherCredentials.phone,
                teacherUserId
            ]);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: 'UPDATE_TEACHER',
                targetUserId: teacherUserId,
                schoolId: authUser.userSchoolId,
                metadata: {
                    teacherId: teacherCredentials.teacherId,
                    name: [
                        teacherCredentials.firstName,
                        teacherCredentials.middleName ?? "",
                        teacherCredentials.firstLastName,
                        teacherCredentials.secondLastName ?? ""
                    ].join(" ")
                }
            });

            await client.query('COMMIT');
            return;
        } catch (error : any) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteTeacher(teacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        const client = await pool.connect()
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

            if (teacher.rowCount === 0) throw new NotFoundError("No se encontro al maestro");

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
                metadata: { teacherId: teacherId, name: [first_name, middle_name ?? "", first_last_name, second_last_name ?? ""].join(" ") }
            });

            await client.query('COMMIT');
            return;
        } catch (error : any) {
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
                console.error('[DEBUG] FK violation detail:', error.detail, '| constraint:', error.constraint);
                throw new ConflictError("No se puede eliminar el maestro porque tiene clases o información guardada.");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}