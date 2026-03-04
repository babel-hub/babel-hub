import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createAuditLog } from "../services/audit.service.js";

export async function getAcademicPeriods(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;

    try {
        const result = await pool.query(`
            SELECT id, name, start_date, end_date
            FROM academic_periods
            WHERE school_id = $1
            ORDER BY start_date ASC;
        `, [schoolId]);

        response.status(200).json({
            periods: result.rows
        });
    } catch (error) {
        console.error("Get Periods Error:", error);
        response.status(500).json({ message: "Failed to fetch academic periods" });
    }
}

export async function postAcademicPeriods(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { name, startDate, endDate } = request.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO academic_periods (name, start_date, end_date, school_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [name, startDate, endDate, creator.schoolId]);

        const periodId = result.rows[0].id;

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "CREATE_PERIOD",
            schoolId: creator.schoolId!,
            metadata: {
                periodId: periodId,
                dates: {
                    start: startDate,
                    end: endDate,
                }
            }
        });

        await client.query('COMMIT');

        response.status(201).json({ message: "Period created successfully", periodId });
    } catch (dbError) {
        await client.query(`ROLLBACK`);
        console.error("Error creating period:", dbError);
        response.status(500).json({ message: "Failed to create period" });
    } finally {
        client.release();
    }
}

export async function updateAcademicPeriod(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { id } = request.params;
    const { name, startDate, endDate } = request.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE academic_periods 
            SET name = $1, start_date = $2, end_date = $3
            WHERE id = $4 AND school_id = $5
            RETURNING id
        `, [name, startDate, endDate, id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return response.status(404).json({ message: "Period not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "UPDATE_PERIOD",
            schoolId: creator.schoolId!,
            metadata: {
                periodId: id,
                updatedFields: { name, startDate, endDate }
            }
        });

        await client.query('COMMIT');
        response.status(200).json({ message: "Period updated successfully" });

    } catch (dbError) {
        await client.query(`ROLLBACK`);
        console.error("Error updating period:", dbError);
        response.status(500).json({ message: "Failed to update period" });
    } finally {
        client.release();
    }
}

export async function deleteAcademicPeriod(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { id } = request.params;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(`
            DELETE FROM academic_periods
            WHERE id = $1 AND school_id = $2
            RETURNING id, name
        `, [id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return response.status(404).json({ message: "Period not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "DELETE_PERIOD",
            schoolId: creator.schoolId!,
            metadata: {
                periodId: id,
                periodName: result.rows[0].name
            }
        });

        await client.query('COMMIT');
        response.status(200).json({ message: "Period deleted successfully" });

    } catch (dbError) {
        await client.query(`ROLLBACK`);
        console.error("Error deleting period:", dbError);
        response.status(500).json({ message: "Failed to delete period" });
    } finally {
        client.release();
    }
}