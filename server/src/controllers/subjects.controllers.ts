import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {createAuditLog} from "../services/audit.service.js";

export async function getAllSubjects(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT id, name 
            FROM subjects 
            WHERE school_id = $1 
            ORDER BY name ASC
        `, [schoolId]);

        response.status(200).json({
            subjects: result.rows
        });

    } catch (dbError) {
        console.error("Database Error fetching subjects:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function createSubject(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { name, areaId } = request.body;

    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        const result = await client.query(`
            INSERT INTO subjects (school_id, name, area_id)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [creator.schoolId, name, areaId]);

        const newSubjectId = result.rows[0].id;

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "CREATE_SUBJECT",
            schoolId: creator.schoolId!,
            metadata: {
                subjectId: newSubjectId,
                name,
                areaId
            }
        });

        await client.query(`COMMIT`);

        response.status(201).json({
            message: "Successfully created subject",
            subjectId: newSubjectId
        });

    } catch (error) {
        await client.query(`ROLLBACK`);
        console.error("Error creating subject:", error);
        response.status(500).json({ message: "Failed to create subject" });
    } finally {
        client.release();
    }
}

export async function getSubject(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const { id } = request.params;

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT id, name, area_id 
            FROM subjects 
            WHERE id = $1 AND school_id = $2
        `, [id, schoolId]);

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "Subject not found" });
        }

        response.status(200).json({ subject: result.rows[0] });
    } catch (dbError) {
        console.error("Database Error fetching subject:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function updateSubject(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { id } = request.params;
    const { name, areaId } = request.body;

    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        const result = await client.query(`
            UPDATE subjects 
            SET name = $1, area_id = $2 
            WHERE id = $3 AND school_id = $4
            RETURNING id, name, area_id
        `, [name, areaId, id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query(`ROLLBACK`);
            return response.status(404).json({ message: "Subject not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "UPDATE_SUBJECT",
            schoolId: creator.schoolId!,
            metadata: { subjectId: id, newName: name, newAreaId: areaId }
        });

        await client.query(`COMMIT`);
        response.status(200).json({ message: "Subject updated successfully", subject: result.rows[0] });

    } catch (error) {
        await client.query(`ROLLBACK`);
        console.error("Error updating subject:", error);
        response.status(500).json({ message: "Failed to update subject" });
    } finally {
        client.release();
    }
}

export async function deleteSubject(
    request: AuthenticatedRequest,
    response: Response
) {
    const creator = request.user!;
    const { id } = request.params;

    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        const result = await client.query(`
            DELETE FROM subjects 
            WHERE id = $1 AND school_id = $2
            RETURNING id, name
        `, [id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query(`ROLLBACK`);
            return response.status(404).json({ message: "Subject not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "DELETE_SUBJECT",
            schoolId: creator.schoolId!,
            metadata: { subjectId: id, deletedName: result.rows[0].name }
        });

        await client.query(`COMMIT`);
        response.status(200).json({ message: "Subject deleted successfully" });

    } catch (error: any) {
        await client.query(`ROLLBACK`);

        if (error.code === '23503') {
            return response.status(409).json({ message: "Cannot delete subject because it is already assigned to active classes." });
        }

        console.error("Error deleting subject:", error);
        response.status(500).json({ message: "Failed to delete subject" });
    } finally {
        client.release();
    }
}