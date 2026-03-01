import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createAuditLog } from "../services/audit.service.js";

export async function getAreas(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM areas 
            WHERE school_id = $1 
            ORDER BY name ASC;
        `, [schoolId]);

        response.status(200).json({ areas: result.rows });
    } catch (dbError) {
        console.error("Database Error fetching areas:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function getArea(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const { id } = request.params;

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM areas
            WHERE id = $1 AND school_id = $2;
        `, [id, schoolId]);

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "Area not found" });
        }

        response.status(200).json({
            area: result.rows[0]
        });
    } catch (dbError) {
        console.error("Database Error fetching area:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function insertArea(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { name } = request.body;

    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        const result = await client.query(`
            INSERT INTO areas (school_id, name)
            VALUES ($1, $2)
            RETURNING id, name
        `, [creator.schoolId, name]);

        const newArea = result.rows[0];

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "CREATE_AREA",
            schoolId: creator.schoolId!,
            metadata: { areaId: newArea.id, name: newArea.name }
        });

        await client.query(`COMMIT`);
        response.status(201).json({ message: "Area created successfully", area: newArea });

    } catch (error) {
        await client.query(`ROLLBACK`);
        console.error("Error creating area:", error);
        response.status(500).json({ message: "Failed to create area" });
    } finally {
        client.release();
    }
}

export async function getSubjectsByArea(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const { areaId } = request.params;

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT id, name, area_id 
            FROM subjects 
            WHERE area_id = $1 AND school_id = $2
            ORDER BY name ASC
        `, [areaId, schoolId]);

        response.status(200).json({ subjects: result.rows });
    } catch (dbError) {
        console.error("Database Error fetching subjects by area:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function updateArea(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { id } = request.params;
    const { name } = request.body;

    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        const result = await client.query(`
            UPDATE areas
            SET name = $1 
            WHERE id = $2 AND school_id = $3
            RETURNING id, name
        `, [name, id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query(`ROLLBACK`);
            return response.status(404).json({ message: "Area not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "UPDATE_AREA",
            schoolId: creator.schoolId!,
            metadata: { areaId: id, newName: name }
        });

        await client.query(`COMMIT`);
        response.status(200).json({ message: "Area updated successfully", area: result.rows[0] });

    } catch (error) {
        await client.query(`ROLLBACK`);
        console.error("Error updating area:", error);
        response.status(500).json({ message: "Failed to update area" });
    } finally {
        client.release();
    }
}

export async function deleteArea(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { id } = request.params;

    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        const result = await client.query(`
            DELETE FROM areas 
            WHERE id = $1 AND school_id = $2
            RETURNING id, name
        `, [id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query(`ROLLBACK`);
            return response.status(404).json({ message: "Area not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "DELETE_AREA",
            schoolId: creator.schoolId!,
            metadata: { areaId: id, deletedName: result.rows[0].name }
        });

        await client.query(`COMMIT`);
        response.status(200).json({ message: "Area deleted successfully" });

    } catch (error: any) {
        await client.query(`ROLLBACK`);

        if (error.code === '23503') {
            return response.status(409).json({ message: "Cannot delete area because it has assigned subjects." });
        }

        console.error("Error deleting area:", error);
        response.status(500).json({ message: "Failed to delete area" });
    } finally {
        client.release();
    }
}