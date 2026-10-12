import type {
    IStudentRepository
} from "../domain/IStudentRepository.js";
import type {
    ClassStudents,
    CreateStudent, GetClassStudentsPayload, GetStudentsByNamePayload, GetStudentsPayload,
    StudentBaseRow,
    StudentByName,
    Students
} from "../domain/Student.types.js";
import { pool } from "../../../db/index.js";
import { supabase } from "../../../services/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type {
    AuthUser,
    StudentCreateCredentials,
    StudentUpdateCredentials
} from "../../shared/domain/Shared.types.js";
import {pgUniqueMessage} from "../../shared/db/pgErrors.js";

export class PostgresStudentRepository implements IStudentRepository {

    async getStudents(payload: GetStudentsPayload, authUser: AuthUser): Promise<Students[]> {
        const { isActive } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    c.id as course_id,
                    c.name as course_name,
                    s.id as student_id,
                    p.first_name as student_first_name,
                    p.middle_name as student_middle_name,
                    p.first_last_name as student_first_last_name,
                    p.second_last_name as student_second_last_name,
                    p.email,
                    p.is_active,
                    s.enrollment_code,
                    p.created_at
                FROM student s
                         JOIN profile p ON s.profile_id = p.id
                         JOIN course c ON s.course_id = c.id
                WHERE p.school_id = $1 AND p.is_active = $2
                ORDER BY p.first_last_name ASC
            `, [userSchoolId, isActive]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getClassStudents(payload: GetClassStudentsPayload, authUser: AuthUser): Promise<ClassStudents[]> {
        const { courseId, isActive } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    st.id as student_id,
                    p.first_name as student_first_name,
                    p.middle_name as student_middle_name,
                    p.first_last_name as student_first_last_name,
                    p.second_last_name as student_second_last_name,
                    p.email,
                    p.is_active
                FROM student st
                         JOIN profile p ON st.profile_id = p.id
                         JOIN course c ON st.course_id = c.id
                WHERE st.course_id = $1 AND p.is_active = $2 AND c.school_id = $3
                ORDER BY
                    LOWER(TRIM(p.first_last_name)) ASC,
                    LOWER(TRIM(p.second_last_name)) ASC NULLS FIRST;
            `, [courseId, isActive, userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getStudentProfile(studentId: string, authUser: AuthUser): Promise<StudentBaseRow | null> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    s.id as student_id,
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name,
                    p.email,
                    p.is_active,
                    p.created_at,
                    c.id as course_id,
                    c.name as course_name,
                    s.enrollment_code,
                    p.user_name,
                    p.phone
                FROM student s
                         JOIN profile p ON s.profile_id = p.id
                         JOIN course c ON s.course_id = c.id
                WHERE s.id = $1 AND p.school_id = $2
            `, [studentId, userSchoolId]);

            if (result.rowCount === 0) return null;
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getStudentsByName(payload: GetStudentsByNamePayload, authUser: AuthUser): Promise<StudentByName[]> {
        const { query, limit } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    s.id AS student_id,
                    p.first_name as student_first_name,
                    p.middle_name as student_middle_name,
                    p.first_last_name as student_first_last_name,
                    p.second_last_name as student_second_last_name,
                    p.email
                FROM student s
                    JOIN profile p ON s.profile_id = p.id
                WHERE p.school_id = $1
                  AND p.is_active = true
                  AND CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) ILIKE $2
                ORDER BY p.first_last_name ASC
                    LIMIT $3
            `, [userSchoolId, `%${query}%`, limit]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async createStudent(credentials: StudentCreateCredentials, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        let authUserId: string | null = null;

        try {
            await client.query('BEGIN');

            const { data, error } = await supabase.auth.admin.createUser({
                email: credentials.email,
                password: credentials.password,
                email_confirm: true,
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
                    email, school_id, user_name, phone, role
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'student')
                    RETURNING id;
            `, [
                authUserId,
                credentials.firstName,
                credentials.middleName,
                credentials.firstLastName,
                credentials.secondLastName,
                credentials.email,
                userSchoolId,
                credentials.userName,
                credentials.phone,
            ]);

            const profileId = profile.rows[0].id;

            await client.query(`
                INSERT INTO student (profile_id, enrollment_code, course_id)
                VALUES ($1, $2, $3)
            `, [profileId, credentials.enrollmentCode, credentials.courseId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: 'CREATE_STUDENT',
                targetUserId: profileId,
                schoolId: userSchoolId,
                metadata: {
                    name: [
                        credentials.firstName,
                        credentials.middleName ?? "",
                        credentials.firstLastName,
                        credentials.secondLastName ?? ""
                    ].join(" "),
                    email: credentials.email,
                    courseId: credentials.courseId,
                }
            });

            await client.query('COMMIT');
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

    async updateStudent(credentials: StudentUpdateCredentials, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const studentCheck = await client.query(`
                SELECT s.profile_id
                FROM student s
                         JOIN profile p ON s.profile_id = p.id
                WHERE s.id = $1 AND p.school_id = $2
            `, [credentials.studentId, userSchoolId]);

            if (studentCheck.rowCount === 0) {
                throw new NotFoundError("El estudiante no se encontró para actualizar");
            }

            const studentProfileId = studentCheck.rows[0].profile_id;

            await client.query(`
                UPDATE profile
                SET first_name = $1, middle_name = $2, first_last_name = $3,
                    second_last_name = $4, user_name = $5, phone = $6
                WHERE id = $7
            `, [
                credentials.firstName,
                credentials.middleName,
                credentials.firstLastName,
                credentials.secondLastName,
                credentials.userName,
                credentials.phone,
                studentProfileId
            ]);

            await client.query(`
                UPDATE student
                SET enrollment_code = $1, course_id = $2
                WHERE id = $3
            `, [credentials.enrollmentCode, credentials.courseId, credentials.studentId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: 'UPDATE_STUDENT',
                targetUserId: studentProfileId,
                schoolId: userSchoolId,
                metadata: {
                    studentId: credentials.studentId,
                    name: [
                        credentials.firstName,
                        credentials.middleName ?? "",
                        credentials.firstLastName,
                        credentials.secondLastName ?? ""
                    ].join(" "),
                    course: credentials.courseId
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

    async deleteStudent(studentId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const studentCheck = await client.query(`
                SELECT
                    s.profile_id,
                    p.auth_profile_id,
                    p.first_name as student_first_name,
                    p.middle_name as student_middle_name,
                    p.first_last_name as student_first_last_name,
                    p.second_last_name as student_second_last_name
                FROM student s
                         JOIN profile p ON s.profile_id = p.id
                WHERE s.id = $1 AND p.school_id = $2
            `, [studentId, userSchoolId]);

            if (studentCheck.rowCount === 0) {
                throw new NotFoundError("El estudiante no se encontró para su eliminación");
            }

            const {
                profile_id,
                auth_profile_id,
                student_first_name,
                student_middle_name,
                student_first_last_name,
                student_second_last_name,
            } = studentCheck.rows[0];

            await client.query(`DELETE FROM student WHERE id = $1`, [studentId]);
            await client.query(`DELETE FROM profile WHERE id = $1`, [profile_id]);

            const { error } = await supabase.auth.admin.deleteUser(auth_profile_id);
            if (error) throw new ValidationError(`No se pudo eliminar el usuario (${error.message})`);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: 'DELETE_STUDENT',
                schoolId: userSchoolId,
                metadata: {
                    studentId,
                    name: [
                        student_first_name,
                        student_middle_name ?? "",
                        student_first_last_name,
                        student_second_last_name ?? ""
                    ].join(" ")
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            let rolledBack = true;
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                rolledBack = false;
                console.error('[CRITICAL] Rollback failed during student deletion, DB state uncertain:', rollbackError);
            }

            if (!rolledBack) {
                console.error(`[CRITICAL] Uncertain state deleting student, profile_id may still exist while Supabase user was deleted. Manual reconciliation needed.`);
            }

            if (error.code === '23503') {
                throw new ConflictError("No se puede eliminar el estudiante porque tiene notas o información guardada.");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}