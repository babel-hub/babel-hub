import type { Request, Response } from 'express';
import { supabase } from "../services/index.js";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {createAuditLog} from "../services/audit.service.js";

export async function createPrincipal(
    request: AuthenticatedRequest,
    response: Response) {
    const { email, password, fullName } = request.body;
    const creator = request.user!;

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (error) return response.status(400).json({ error: error.message || "Failed to authenticate" });

        const authUserId = data.user?.id;

        const  client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `
                INSERT INTO users (supabase_user_id, email ,role, school_id, full_name) VALUES ($1, $2, 'principal', $3, $4)
            `,
                [authUserId, email, creator.schoolId, fullName]
            );

            await createAuditLog(client, {
                actorUserId: creator.userId as string,
                actorRole:creator.role as string,
                schoolId:creator.schoolId as string,
                targetUserId:authUserId,
                action:"CREATE_PRINCIPAL",
                metadata: {
                    fullName,
                    email
                }
            })

            await client.query("COMMIT");

            response.status(200).json({
                "message": "Principal successfully created",
                "principal": authUserId
            });
        } catch (dbError) {
            await client.query("ROLLBACK");
            await supabase.auth.admin.deleteUser(authUserId);

            console.error("Transaction Error - Principal creation rolled back:", dbError);
            response.status(500).json({ message: "Database error: Principal creation failed" });
        } finally {
            client.release();
        }

        /*
        await pool.query(
            `
                INSERT INTO principals (user_id) VALUES ($1)
            `,
            [authUserId]
        )
        */
    } catch (error) {
        response.status(400).json({message: "Failed to create principal"});
    }
}