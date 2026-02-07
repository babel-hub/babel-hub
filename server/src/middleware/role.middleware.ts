import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { pool } from "../db/index.js"
import type { UserRole } from "../types/types.js";

export function authorizedRoles (
    allow: Array<UserRole>
) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user?.supabaseUserId) {
            return res.status(403).send("Unauthenticated");
        }

        //console.warn(req);

        try {
            const result = await pool.query(
                `SELECT * FROM users WHERE supabase_user_id = $1`,
                [req.user.supabaseUserId]
            );

            //console.warn(result);

            if (result.rows.length === 0) {
                return res.status(403).json({ message: "User not registered" });
            }

            const user = result.rows[0];

            if (!allow.includes(user.role)) {
                return res.status(403).send("Forbidden");
            }

            req.user.userId = user.id;
            req.user.email = user.email;
            req.user.role = user.role;
            req.user.schoolId = user.school_id;

            next()
        } catch (error) {
            console.error("DEBUG - Full Database Error:", error);
            return res.status(500).json({
                message: "Authorization error",
                details: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}