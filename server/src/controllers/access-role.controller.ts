import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

type UserProfileResponse = {
    id: string;
    name: string;
    role: string;
    email: string;
    school_id: string | null;
    profile_id: string | null;
    is_profile_complete: boolean;
};

export async function getUserRole(
    request: AuthenticatedRequest,
    response: Response
) {
    const { supabaseUserId } = request.user!;

    try {
        const userResult = await pool.query(
            `SELECT id, school_id, email, full_name, role FROM users WHERE supabase_user_id = $1`,
            [supabaseUserId]
        );

        if (userResult.rowCount === 0) {
            return response.status(404).json({ message: "User not found in local database" });
        }

        const internalUserId = userResult.rows[0].id;
        const dbSchoolId = userResult.rows[0].school_id;
        const email = userResult.rows[0].email;
        const name = userResult.rows[0].full_name;
        const realRole = userResult.rows[0].role;

        let profileId: string | null = null;

        if (realRole === "student") {
            const result = await pool.query(
                `SELECT id FROM students WHERE user_id = $1`,
                [internalUserId]
            );
            if (result.rows.length > 0) profileId = result.rows[0].id;

        } else if (realRole === "teacher") {
            const result = await pool.query(
                `SELECT id FROM teachers WHERE user_id = $1`,
                [internalUserId]
            );
            if (result.rows.length > 0) profileId = result.rows[0].id;

        } else if (realRole === "principal") {
            profileId = internalUserId;
        }

        const responseData: UserProfileResponse = {
            id: internalUserId,
            role: realRole!,
            name: name!,
            email: email,
            school_id: dbSchoolId,
            profile_id: profileId,
            is_profile_complete: !!profileId
        };

        response.json(responseData);
    } catch (error) {
        console.error("Get User Role Error:", error);
        response.status(500).json({ message: "Failed to load profile" });
    }
}