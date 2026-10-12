import type { IGradingTemplateRepository } from "../domain/IGradingTemplateRepository.js";
import type {
    AssessmentCriteria,
    GradingTemplate,
    CreateGradingTemplatePayload,
    UpdateGradingTemplatePayload,
    DeleteGradingTemplatePayload,
    GetGradingTemplateDetailsPayload
} from "../domain/GradingTemplate.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError } from "../../errors/domain/CustomErrors.js";

export class PostgresGradingTemplateRepository implements IGradingTemplateRepository {

    async getGradingTemplates(authUser: AuthUser): Promise<GradingTemplate[]> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    g.id,
                    g.name,
                    g.school_id,
                    s.id AS scale_id,
                    s.min_value AS scale_min,
                    s.max_value AS scale_max
                FROM grading_template g
                         JOIN scale s ON g.scale_id = s.id
                WHERE g.school_id = $1
                ORDER BY g.name ASC;
            `, [userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getGradingTemplateDetails(
        payload: GetGradingTemplateDetailsPayload,
        authUser: AuthUser
    ): Promise<AssessmentCriteria> {
        const { gradingId } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const grading = await client.query(`
                SELECT name AS grading_name
                FROM grading_template
                WHERE school_id = $1 AND id = $2
            `, [userSchoolId, gradingId]);

            if (grading.rowCount === 0) {
                throw new NotFoundError(`No se encontró el criterio con el id ${gradingId}`);
            }

            const assessments = await client.query(`
                SELECT id, name, weight, grading_template_id
                FROM assessment_criteria
                WHERE grading_template_id = $1
                ORDER BY name ASC;
            `, [gradingId]);

            return {
                grading_name: grading.rows[0].grading_name,
                assessments: assessments.rows
            };
        } finally {
            client.release();
        }
    }

    async createGradingTemplate(
        payload: CreateGradingTemplatePayload,
        authUser: AuthUser
    ): Promise<void> {
        const { gradingName, gradingScaleId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const grading = await client.query(`
                INSERT INTO grading_template (name, school_id, scale_id)
                VALUES ($1, $2, $3)
                    RETURNING id
            `, [gradingName, userSchoolId, gradingScaleId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_GRADING_TEMPLATE",
                schoolId: userSchoolId,
                metadata: {
                    gradingId: grading.rows[0].id,
                    gradingName
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') throw new ConflictError("La escala seleccionada no existe");
            throw error;
        } finally {
            client.release();
        }
    }

    async updateGradingTemplate(
        payload: UpdateGradingTemplatePayload,
        authUser: AuthUser
    ): Promise<void> {
        const { gradingId, gradingName, gradingScaleId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE grading_template
                SET name = $1, scale_id = $2
                WHERE id = $3 AND school_id = $4
            `, [gradingName, gradingScaleId, gradingId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError(`No se encontró el criterio con id ${gradingId}`);
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_GRADING_TEMPLATE",
                schoolId: userSchoolId,
                metadata: {
                    gradingId,
                    gradingName
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') throw new ConflictError("La escala seleccionada no existe");
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteGradingTemplate(
        payload: DeleteGradingTemplatePayload,
        authUser: AuthUser
    ): Promise<void> {
        const { gradingId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM grading_template
                WHERE id = $1 AND school_id = $2
                    RETURNING id
            `, [gradingId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError(`No fue posible eliminar el criterio con id ${gradingId}`);
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_GRADING_TEMPLATE",
                schoolId: userSchoolId,
                metadata: { gradingId }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') throw new ConflictError("El criterio tiene evaluaciones activas");
            throw error;
        } finally {
            client.release();
        }
    }
}