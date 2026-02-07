import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabase } from "../services/index.js";
import {findSourceMap} from "node:module";
import {createAuditLog} from "../services/audit.service.js";

export async function registerStudent (
    request: AuthenticatedRequest,
    response: Response) {
    const { email,  password, fullName, enrollmentCode } = request.body;
    const creator = request.user!;

    try {
        const { data, error: supabaseError } =  await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (supabaseError) return response.status(400).send({ "message":  supabaseError.message });

        const authUserId = data.user?.id;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(`
                INSERT INTO users (supabase_user_id, role, school_id, email, full_name) 
                VALUES ($1, $2, $3, $4, $5)
            `, [authUserId, 'student', creator.schoolId, email, fullName]);

            await client.query(`
                INSERT INTO students (user_id, enrollment_code)
                VALUES ($1, $2)
            `, [authUserId, enrollmentCode]);

            await createAuditLog(client, {
                actorUserId: creator.userId as string,
                actorRole: creator.role as string,
                action: 'CREATE_STUDENT',
                targetUserId: authUserId,
                schoolId: creator.schoolId as string,
                metadata: {
                    email,
                    enrollmentCode
                }
            });

            await client.query(`COMMIT`);

            response.status(200).json({
                "message": "Student created",
                "student": authUserId
            })
        } catch (dbError) {
            await client.query(`ROLLBACK`);
            await supabase.auth.admin.deleteUser(authUserId);

            console.error("Transaction Error - student creation rolled back:", dbError);
            response.status(500).json({ message: "Database error: Student creation failed" });
        } finally {
            client.release();
        }
    } catch (error) {
        response.status(500).json({ message: "Failed to create student" });
    }
}