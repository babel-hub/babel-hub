import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js"
import { supabase } from "../services/index.js";
import {createAuditLog} from "../services/audit.service.js";

export async function registerTeacher(
    request: AuthenticatedRequest,
    response: Response) {
    const { email, password, fullName } = request.body;
    const creator = request.user!;

    try {
        const { data, error: supabaseError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (supabaseError) return response.status(400).json({ "message": supabaseError.message });

        const authUserId = data.user?.id;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `INSERT INTO users (supabase_user_id, role, school_id, email, full_name) 
                VALUES ($1, 'teacher', $2, $3, $4)
                RETURNING id`,
                [authUserId, creator.schoolId, email, fullName]
            )

            const teacherId = result.rows[0].id;

            await client.query(
                `INSERT INTO teachers (user_id) 
                VALUES ($1)`,
                [teacherId]
            )

            await createAuditLog(client, {
                targetUserId: teacherId,
                actorUserId: creator.userId as string,
                actorRole: creator.role as string,
                action: "CREATE_TEACHER",
                schoolId:creator.schoolId as string,
                metadata: {
                    fullName,
                    email
                }
            })

            await client.query("COMMIT");

            response.status(200).json({
                "message": "teacher created",
                "teacher": teacherId
            })
        } catch (dbError) {
            await client.query("ROLLBACK");
            await supabase.auth.admin.deleteUser(authUserId);

            console.error("Transaction Error - Teacher creation rolled back:", dbError);
            response.status(500).json({ message: "Database error: Teacher creation failed" });
        } finally {
            client.release()
        }
    } catch (error) {
        response.status(500).json({ message: "Failed to create teacher" });
    }
}

export async function getTeachers(
    request: AuthenticatedRequest,
    response: Response
) {
    const { available } = request.query;
    const client = await pool.connect();

    try {
        let queryText = `
            SELECT
                t.id,
                t.user_id,
                t.created_at,
                u.full_name,
                u.email,
                COUNT(cl.id)::int AS total_classes
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN classes cl ON cl.teacher_id = t.id
        `;

        if (available === 'true') {
            queryText += `
                LEFT JOIN courses co ON t.id = co.teacher_id
                WHERE co.teacher_id IS NULL
            `;
        }

        queryText += `
            GROUP BY t.id, t.user_id, t.created_at, u.full_name, u.email
            ORDER BY u.full_name ASC;
        `;

        const result = await client.query(queryText);

        response.status(200).json({
            teachers: result.rows
        });

    } catch (dbError) {
        console.error("Database Error - GET Teachers failed:", dbError);
        response.status(500).json({ message: "Database error: GET Teachers failed" });
    } finally {
        client.release();
    }
}