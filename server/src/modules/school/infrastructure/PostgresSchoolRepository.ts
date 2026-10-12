import type { ISchoolRepository } from "../domain/ISchoolRepository.js";
import type { CreateSchoolPayload } from "../domain/School.types.js";
import type { MasterAuth } from "../../shared/auth/requireMaster.js";
import { pool } from "../../../db/index.js";
import { supabase } from "../../../services/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, ValidationError } from "../../errors/domain/CustomErrors.js";
import {pgUniqueMessage} from "../../shared/db/pgErrors.js";

export class PostgresSchoolRepository implements ISchoolRepository {

    async createSchool(payload: CreateSchoolPayload, authUser: MasterAuth): Promise<void> {
        const { schoolName, principal } = payload;
        const { userId, userRole } = authUser;

        const client = await pool.connect();
        let authUserId: string | null = null;

        try {
            await client.query('BEGIN');

            const school = await client.query(`
                INSERT INTO school (name) VALUES ($1) RETURNING id
            `, [schoolName]);

            const schoolId = school.rows[0].id;

            const { data, error } = await supabase.auth.admin.createUser({
                email: principal.email,
                password: principal.password,
                email_confirm: true,
            });

            if (error) {
                if (error.code === 'email_exists') {
                    throw new ConflictError("Ya existe un usuario con la misma dirección de email");
                }
                throw new ValidationError(`No se pudo crear el usuario (${error.message})`);
            }

            authUserId = data.user?.id as string;

            const profile = await client.query(`
                INSERT INTO profile (
                    auth_profile_id, first_name, middle_name, first_last_name,
                    second_last_name, role, email, school_id
                )
                VALUES ($1, $2, $3, $4, $5, 'principal', $6, $7)
                    RETURNING id
            `, [
                authUserId,
                principal.firstName,
                principal.middleName,
                principal.firstLastName,
                principal.secondLastName,
                principal.email,
                schoolId
            ]);

            const profileId = profile.rows[0].id;

            await client.query(`
                INSERT INTO principal (profile_id) VALUES ($1)
            `, [profileId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_SCHOOL",
                targetUserId: profileId,
                schoolId,
                metadata: {
                    schoolName,
                    principalEmail: principal.email
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            let rolledBack = true;
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                rolledBack = false;
                console.error('[CRITICAL] Rollback failed, DB state uncertain:', rollbackError);
            }

            if (authUserId && rolledBack) {
                try {
                    console.warn(`[Error]: Eliminando usuario huérfano de Supabase: ${authUserId}`);
                    await supabase.auth.admin.deleteUser(authUserId);
                } catch (cleanupError) {
                    console.error(`Failed to delete orphaned Supabase user ${authUserId}:`, cleanupError);
                }
            } else if (authUserId && !rolledBack) {
                console.error(`[CRITICAL] Uncertain state for authUserId=${authUserId}, profile may or may not exist. Manual reconciliation needed.`);
            }

            if (error.code === '23505') {
                throw new ConflictError(pgUniqueMessage(error.constraint));
            }

            if (error.code === '23503') {
                throw new ConflictError("Una referencia a otro registro es inválida");
            }

            throw error;
        } finally {
            client.release();
        }
    }
}