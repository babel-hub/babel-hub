import type {
    IAssessmentRepository
} from "../domain/IAssessmentRepository.js";
import type { Assessment, BaseAssessment, UpdateAssessmentPayload, CreateAssessmentPayload } from "../domain/Assessment.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError } from "../../errors/domain/CustomErrors.js";

export class PostgresAssessmentRepository implements IAssessmentRepository {

    async getAssessments(authUser: AuthUser): Promise<Assessment[]> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    a.id,
                    a.name,
                    a.weight,
                    a.grading_template_id
                FROM assessment_criteria a
                         JOIN grading_template g ON a.grading_template_id = g.id
                WHERE g.school_id = $1
            `, [userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getAssessmentByAssignment(classId: string, authUser: AuthUser): Promise<BaseAssessment[]> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    ac.id,
                    ac.name,
                    ac.weight::float AS weight
                FROM assessment_criteria ac
                         JOIN subject s ON ac.grading_template_id = s.grading_template_id
                         JOIN class c ON c.subject_id = s.id
                         JOIN course co ON c.course_id = co.id
                WHERE c.id = $1 AND co.school_id = $2
                ORDER BY ac.weight DESC
            `, [classId, userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getTotalWeightForTemplate(
        gradingTemplateId: string,
        excludeAssessmentId?: string
    ): Promise<number> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT COALESCE(SUM(weight), 0)::float AS total_weight
                FROM assessment_criteria
                WHERE grading_template_id = $1
                  AND id != COALESCE($2, '00000000-0000-0000-0000-000000000000'::uuid)
            `, [gradingTemplateId, excludeAssessmentId ?? null]);

            return result.rows[0].total_weight;
        } finally {
            client.release();
        }
    }

    async createAssessment(payload: CreateAssessmentPayload, authUser: AuthUser): Promise<void> {
        const { assessmentName, assessmentWeight, gradingTemplateId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const templateCheck = await client.query(`
                SELECT 1 FROM grading_template
                WHERE id = $1 AND school_id = $2
            `, [gradingTemplateId, userSchoolId]);

            if (templateCheck.rowCount === 0) {
                throw new NotFoundError("La plantilla de calificación no existe o no pertenece a este colegio.");
            }

            const result = await client.query(`
                INSERT INTO assessment_criteria (name, weight, grading_template_id)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [assessmentName, assessmentWeight, gradingTemplateId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_ASSESSMENT",
                schoolId: userSchoolId,
                metadata: {
                    assessmentId: result.rows[0].id,
                    assessmentName
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("La plantilla de calificación seleccionada no existe.");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async updateAssessment(payload: UpdateAssessmentPayload, authUser: AuthUser): Promise<void> {
        const { assessmentId, assessmentName, assessmentWeight, gradingTemplateId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkAssessment = await client.query(`
                SELECT 1
                FROM assessment_criteria a
                         JOIN grading_template g ON a.grading_template_id = g.id
                WHERE g.school_id = $1
                  AND a.grading_template_id = $2
                  AND a.id = $3
            `, [userSchoolId, gradingTemplateId, assessmentId]);

            if (checkAssessment.rowCount === 0) {
                throw new NotFoundError("El criterio no existe, no pertenece a este colegio, o la plantilla indicada no coincide con la actual.");
            }

            await client.query(`
                UPDATE assessment_criteria
                SET name = $1, weight = $2
                WHERE id = $3
            `, [assessmentName, assessmentWeight, assessmentId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_ASSESSMENT",
                schoolId: userSchoolId,
                metadata: { assessmentId, assessmentName }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("La plantilla de calificación seleccionada no existe.");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteAssessment(assessmentId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM assessment_criteria a
                    USING grading_template g
                WHERE a.grading_template_id = g.id
                  AND g.school_id = $1
                  AND a.id = $2
                    RETURNING a.id, a.name
            `, [userSchoolId, assessmentId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("El criterio de evaluación no existe o no pertenece a este colegio.");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_ASSESSMENT",
                schoolId: userSchoolId,
                metadata: {
                    assessmentId,
                    assessmentName: result.rows[0].name
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("No se puede eliminar el criterio porque tiene calificaciones o tareas asignadas.");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}