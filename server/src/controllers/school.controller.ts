import { pool } from "../db/index.js";
import type { Response } from "express";
import { supabase } from "../services/index.js";
import { createAuditLog } from "../services/audit.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

interface PrincipalData {
    email: string;
    password: string;
    fullName: string;
}

interface BodyReq {
    schoolName: string;
    principal: PrincipalData;
}

export async function registerSchool(
    request: AuthenticatedRequest,
    response: Response): Promise<void> {
    const { schoolName, principal } = request.body as BodyReq;
    const creator = request.user!;

    if (creator.role !== "admin") {
        response.status(403).json({ message: "Forbidden" });
        return;
    }

    const client = await pool.connect();
    let authUserId: string | null = null;

    try {
        await client.query("BEGIN");

        const school = await client.query(`
            INSERT INTO schools (name) VALUES ($1)
            `, [schoolName]);
        const schoolId = school.rows[0].id;

        const { data, error: supaError } = await supabase.auth.admin.createUser({
            email: principal.email,
            password: principal.password,
            email_confirm: true,
        });

        if (supaError) throw supaError;

        authUserId = data.user?.id

        await client.query(`
            INSERT INTO users (supabase_user_id, role, shool_id, email, full_name)
            VALUES ($1, $2, $3, $4, $5)
            `, [authUserId, 'principal', schoolId, principal.email, principal.fullName]);

        await createAuditLog(client, {
            actorUserId: creator.userId as string,
            actorRole: creator.role,
            action: "CREATE_SHOOL",
            targetUserId: authUserId,
            schoolId,
            metadata: { schoolName }
        })

        await client.query("COMMIT");

        response.status(201).json({
            message: "School successfully created",
            id: schoolId
        });
    } catch (dbError) {
        await client.query("ROLLBACK");
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId);

        response.status(500).json({
            message: "Failed to create school",
        });
    } finally {
        client.release()
    }
}