import type { ISubjectsRepository } from "../domain/ISubjectsRepository.js";
import type {
    AvailableSubjects,
    CreateSubject,
    CreateSubjectPayload, GetAvailableSubjectsPayload,
    GetSubjectsByAreaPayload, SubjectById,
    SubjectDetails, UpdateSubjectPayload
} from "../domain/Subjects.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError } from "../../errors/domain/CustomErrors.js";

export class PostgresSubjectRepository implements ISubjectsRepository {
    async getSubjectById(subjectId: string, authUser: AuthUser): Promise<SubjectById | null> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            const query = `
                SELECT
                    s.id,
                    s.grading_template_id
                FROM subject s
                         JOIN area a ON s.area_id = a.id
                WHERE s.id = $1 AND a.school_id = $2
            `;

            const result = await client.query(query, [subjectId, userSchoolId]);
            return result.rows[0] ?? null;
        } finally {
            client.release();
        }
    }

    async getSubjectsByArea(payload: GetSubjectsByAreaPayload, authUser: AuthUser): Promise<SubjectDetails[]> {
        const { subjectAreaId } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    a.id AS area_id,
                    a.name AS area_name,
                    s.id,
                    s.name,
                    g.id AS grading_template_id,
                    g.name AS grading_template_name
                FROM subject s
                         JOIN area a ON s.area_id = a.id
                         JOIN grading_template g ON s.grading_template_id = g.id
                WHERE s.area_id = $1 AND a.school_id = $2
                ORDER BY s.name ASC
            `, [subjectAreaId, userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getAvailableSubjects(payload: GetAvailableSubjectsPayload, authUser: AuthUser): Promise<AvailableSubjects[]> {
        const { courseId } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query<AvailableSubjects>(`
                SELECT
                    s.id,
                    s.name
                FROM subject s
                         JOIN area a ON s.area_id = a.id
                WHERE a.school_id = $1
                  AND s.id NOT IN (
                    SELECT subject_id FROM class WHERE course_id = $2
                )
                ORDER BY s.name ASC;
            `, [userSchoolId, courseId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async createSubject(payload: CreateSubjectPayload, authUser: AuthUser): Promise<CreateSubject> {
        const { subjectName, subjectAreaId, gradingTemplateId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO subject (name, area_id, grading_template_id)
                VALUES ($1, $2, $3)
                    RETURNING id
            `, [subjectName, subjectAreaId, gradingTemplateId]);

            const subjectId = result.rows[0].id;

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_SUBJECT",
                schoolId: userSchoolId,
                metadata: {
                    subjectId,
                    name: subjectName,
                    area: subjectAreaId,
                }
            });

            await client.query('COMMIT');

            return { id: subjectId };
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("El área o la plantilla de evaluación no existe");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async updateSubject(payload: UpdateSubjectPayload, authUser: AuthUser): Promise<void> {
        const { subjectId, subjectName, subjectAreaId, gradingTemplateId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE subject s
                SET name = $1, area_id = $2, grading_template_id = $3
                    FROM area a
                WHERE s.id = $4
                  AND s.area_id = a.id
                  AND a.school_id = $5
            `, [subjectName, subjectAreaId, gradingTemplateId, subjectId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("No se encontró la asignatura para su actualización");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_SUBJECT",
                schoolId: userSchoolId,
                metadata: { subjectId, newName: subjectName, newAreaId: subjectAreaId }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("El área o la plantilla de evaluación no existe");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteSubject(subjectId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM subject s
                    USING area a
                WHERE s.id = $1
                  AND s.area_id = a.id
                  AND a.school_id = $2
                    RETURNING s.id, s.name
            `, [subjectId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("No se encontró la asignatura para su eliminación");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_SUBJECT",
                schoolId: userSchoolId,
                metadata: { subjectId, name: result.rows[0].name }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("No se puede eliminar porque la asignatura está asignada a clases activas");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}