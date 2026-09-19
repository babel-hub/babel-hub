import type { IUserRepository } from "../domain/IUserRepository.js";
import type { UserProfileResponse } from "../domain/User.types.js";
import { pool } from "../../../db/index.js";

export class PostgresUserRepository implements IUserRepository {
    async getUser(clientId: string): Promise<UserProfileResponse | null> {
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
                WHERE auth_profile_id = $1`, [clientId]);

            if (profile.rowCount === 0) return null;

            const internalUserId = profile.rows[0].id;
            const firstName = profile.rows[0].first_name;
            const middleName = profile.rows[0].middle_name;
            const firstLastName = profile.rows[0].first_last_name;
            const secondLastName = profile.rows[0].second_last_name;
            const realRole = profile.rows[0].role;
            const email = profile.rows[0].email;
            const isActive = profile.rows[0].is_active;
            const dbSchoolId = profile.rows[0].school_id;

            let profileId: string = "";

            switch (realRole) {
                case "admin": {
                    const admin = await client.query(`SELECT id FROM admin WHERE profile_id = $1`, [internalUserId]);
                    if (admin.rows.length > 0) profileId = admin.rows[0].id;
                    break;
                }
                case "principal": {
                    const principal = await client.query(`SELECT id FROM principal WHERE profile_id = $1`, [internalUserId]);
                    if (principal.rows.length > 0) profileId = principal.rows[0].id;
                    break;
                }
                case "teacher": {
                    const teacher = await client.query(`SELECT id FROM teacher WHERE profile_id = $1`, [internalUserId]);
                    if (teacher.rows.length > 0) profileId = teacher.rows[0].id;
                    break;
                }
                case "student": {
                    const student = await client.query(`SELECT id FROM student WHERE profile_id = $1`, [internalUserId]);
                    if (student.rows.length > 0) profileId = student.rows[0].id;
                    break;
                }
                case "parent": {
                    const parent = await client.query(`SELECT id FROM parent WHERE profile_id = $1`, [internalUserId]);
                    if (parent.rows.length > 0) profileId = parent.rows[0].id;
                    break;
                }
                default:
                    return null;
            }

            return {
                // And this id is from the specific role table of the user admin, teacher, student etc.
                id: profileId,
                first_name: firstName,
                middle_name: middleName,
                first_last_name: firstLastName,
                second_last_name: secondLastName,
                role: realRole!,
                email: email,
                is_active: isActive,
                school_id: dbSchoolId,
                // This id is from the main table, that gathers all the users
                profile_id: internalUserId,
                is_profile_complete: !!profileId
            };
        } finally {
            client.release();
        }
    }
}