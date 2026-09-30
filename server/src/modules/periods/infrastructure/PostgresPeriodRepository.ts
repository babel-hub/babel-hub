import type { IPeriodsRepository } from "../domain/IPeriodRepository.js";
import type { CreatePeriod, Period, UpdatePeriod } from "../domain/Period.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export class PostgresPeriodRepository implements IPeriodsRepository {
    async getPeriods(userSchoolId: string): Promise<Period[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    id,
                    name,
                    start_date,
                    end_date,
                    (CURRENT_DATE BETWEEN start_date AND end_date) AS is_current
                FROM academic_period
                WHERE school_id = $1
                ORDER BY start_date ASC;
            `, [userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async checkPeriodOverlap(schoolId: string, startDate: string, endDate: string, excludePeriodId?: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 1 FROM academic_period
                WHERE school_id = $1
                  AND start_date <= $3::DATE
                  AND end_date >= $2::DATE
                  AND id != COALESCE($4, '00000000-0000-0000-0000-000000000000'::uuid)
                LIMIT 1;
            `, [schoolId, startDate, endDate, excludePeriodId ?? null]);

            return (result.rowCount !== null && result.rowCount > 0);
        } finally {
            client.release();
        }
    }

    async createPeriod(periodName: string, startDate: string, endDate: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO academic_period (name, start_date, end_date, school_id)
                VALUES ($1, $2, $3, $4)
                    RETURNING id
            `, [periodName, startDate, endDate, userSchoolId]);

            const periodId = result.rows[0].id;

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_PERIOD",
                schoolId: userSchoolId,
                metadata: {
                    periodId: periodId,
                    dates: {
                        start: startDate,
                        end: endDate,
                    }
                }
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updatePeriod(periodId: string, periodName: string, startDate: string, endDate: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE academic_period
                SET name = $1, start_date = $2, end_date = $3
                WHERE id = $4 AND school_id = $5
                    RETURNING id
            `, [periodName, startDate, endDate, periodId, userSchoolId]);

            if (result.rowCount === 0) throw new NotFoundError("El periodo no existe o no pertenece a este colegio.");

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_PERIOD",
                schoolId: userSchoolId,
                metadata: {
                    periodId: periodId,
                    updatedFields: { periodName, startDate, endDate }
                }
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deletePeriod(periodId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM academic_period
                WHERE id = $1 AND school_id = $2
                    RETURNING id, name
            `, [periodId, userSchoolId]);

            if (result.rowCount === 0) throw new NotFoundError("El periodo que intentas borrar no existe o no pertenece a este colegio.");

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_PERIOD",
                schoolId: userSchoolId,
                metadata: {
                    periodId: periodId,
                    periodName: result.rows[0].name
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');

            if (error.code === '23503') throw new ConflictError("No se puede eliminar el periodo porque tiene asistencia, clases o calificaciones vinculadas.");

            throw error;
        } finally {
            client.release();
        }
    }
}