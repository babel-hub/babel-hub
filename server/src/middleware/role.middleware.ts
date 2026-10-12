import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { pool } from "../db/index.js";
import type { UserRole } from "../types/types.js";

export function authorizedRoles(allow: Array<UserRole>) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user?.authUserId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        try {
            const result = await pool.query(
                `SELECT id, email, role, school_id FROM profile WHERE auth_profile_id = $1`,
                [req.user.authUserId]
            );

            if (result.rows.length === 0) {
                return res.status(403).json({ message: "Usuario no registrado" });
            }

            const user = result.rows[0];

            if (!allow.includes(user.role)) {
                return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
            }

            req.user.userId = user.id;
            req.user.email = user.email;
            req.user.role = user.role;
            req.user.schoolId = user.school_id;

            req.authUser = {
                userId: user.id,
                userRole: user.role,
                userSchoolId: user.school_id,
            };

            next();
        } catch (error) {
            console.error("Authorization Database Error:", error);
            return res.status(500).json({ message: "Error interno del servidor al verificar permisos" });
        }
    };
}