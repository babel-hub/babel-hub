import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

type UserProfileResponse = {
    id: string;
    role: string;
    email: string;
    school_id: string | null;
    profile_id: string | null;
    is_profile_complete: boolean;
};

export async function getUserRole(
    req: AuthenticatedRequest,
    res: Response
) {
    const { userId, role, email, schoolId: tokenSchoolId } = req.user!;

    try {
        let profileId: string | null = null;
        let dbSchoolId: string | null = null;

        if (role === "student") {
            const result = await pool.query(
                `SELECT id, school_id FROM students WHERE user_id = $1`, // FIXED: userId -> user_id
                [userId]
            );
            if (result.rows.length > 0) {
                profileId = result.rows[0].id;
                dbSchoolId = result.rows[0].school_id;
            }
        } else if (role === "teacher") {
            const result = await pool.query(
                `SELECT id, school_id FROM teachers WHERE user_id = $1`,
                [userId]
            );
            if (result.rows.length > 0) {
                profileId = result.rows[0].id;
                dbSchoolId = result.rows[0].school_id;
            }
        } else if (role === "principal") {
            const result = await pool.query(
                `SELECT id, school_id FROM principals WHERE user_id = $1`,
                [userId]
            );
            if (result.rows.length > 0) {
                profileId = result.rows[0].id;
                dbSchoolId = result.rows[0].school_id;
            }
        }

        const finalSchoolId = dbSchoolId || tokenSchoolId;

        const responseData: UserProfileResponse = {
            id: userId!,
            role: role!,
            email: email!,
            school_id: finalSchoolId!,
            profile_id: profileId,
            is_profile_complete: !!profileId
        };

        res.json(responseData);
    } catch (error) {
        console.error("Get User Role Error:", error);
        res.status(500).json({ message: "Failed to load profile" });
    }
}