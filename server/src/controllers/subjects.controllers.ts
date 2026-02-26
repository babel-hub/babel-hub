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