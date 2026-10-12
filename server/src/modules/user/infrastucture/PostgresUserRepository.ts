import type { IUserRepository } from "../domain/IUserRepository.js";
import type { GetUsersByNamePayload, UserProfileResponse, UserSearch } from "../domain/User.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";

export class PostgresUserRepository implements IUserRepository {

    async getUser(authUserId: string): Promise<UserProfileResponse | null> {
        const client = await pool.connect();
        try {
            const profile = await client.query(`
                SELECT
                    id,
                    first_name,
                    middle_name,
                    first_last_name,
                    second_last_name,
                    role,
                    email,
                    is_active,
                    school_id
                FROM profile
                WHERE auth_profile_id = $1
            `, [authUserId]);

            if (profile.rowCount === 0) return null;

            const row = profile.rows[0];
            const internalUserId = row.id;
            const realRole = row.role;

            let roleTableId: string = "";

            switch (realRole) {
                case "admin": {
                    const admin = await client.query(`SELECT id FROM admin WHERE profile_id = $1`, [internalUserId]);
                    if (admin.rows.length > 0) roleTableId = admin.rows[0].id;
                    break;
                }
                case "principal": {
                    const p = await client.query(`SELECT id FROM principal WHERE profile_id = $1`, [internalUserId]);
                    if (p.rows.length > 0) roleTableId = p.rows[0].id;
                    break;
                }
                case "teacher": {
                    const t = await client.query(`SELECT id FROM teacher WHERE profile_id = $1`, [internalUserId]);
                    if (t.rows.length > 0) roleTableId = t.rows[0].id;
                    break;
                }
                case "student": {
                    const s = await client.query(`SELECT id FROM student WHERE profile_id = $1`, [internalUserId]);
                    if (s.rows.length > 0) roleTableId = s.rows[0].id;
                    break;
                }
                case "parent": {
                    const pr = await client.query(`SELECT id FROM parent WHERE profile_id = $1`, [internalUserId]);
                    if (pr.rows.length > 0) roleTableId = pr.rows[0].id;
                    break;
                }
                default:
                    return null;
            }

            return {
                id: roleTableId,
                first_name: row.first_name,
                middle_name: row.middle_name,
                first_last_name: row.first_last_name,
                second_last_name: row.second_last_name,
                role: realRole,
                email: row.email,
                is_active: row.is_active,
                school_id: row.school_id,
                profile_id: internalUserId,
                is_profile_complete: !!roleTableId
            };
        } finally {
            client.release();
        }
    }

    async getUsersByName(payload: GetUsersByNamePayload, authUser: AuthUser): Promise<UserSearch[]> {
        const { query, limit } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    id,
                    first_name,
                    middle_name,
                    first_last_name,
                    second_last_name,
                    role
                FROM profile
                WHERE school_id = $1
                  AND is_active = true
                  AND CONCAT_WS(' ', first_name, middle_name, first_last_name, second_last_name) ILIKE $2
                ORDER BY first_last_name ASC
                    LIMIT $3
            `, [userSchoolId, `%${query}%`, limit]);

            return result.rows;
        } finally {
            client.release();
        }
    }
}