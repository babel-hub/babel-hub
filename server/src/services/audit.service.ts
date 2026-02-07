import { pool } from "../db/index.js";

interface AuditLogInputs {
    actorUserId: string;
    actorRole: string;
    action: string;
    schoolId: string;
    targetUserId?: string;
    metadata?: any;
}

export async function createAuditLog(
    client: any,
    data: AuditLogInputs) {
    await client.query(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          actor_role,
          action,
          target_user_id,
          school_id,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
            data.actorUserId,
            data.actorRole,
            data.action,
            data.targetUserId ?? null,
            data.schoolId,
            data.metadata ?? null,
        ]
    );
}