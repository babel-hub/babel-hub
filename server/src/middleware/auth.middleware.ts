import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../types/types.js";
import {supabase} from "../services/index.js";

interface AuthPayload extends JwtPayload {
    sub: string;
    email?: string;
    role?: string;
    schoolId?: string;
    app_metadata?: {
        role?: string;
        provider?: string;
    };
    user_metadata?: {
        role?: string;
    };
}

export interface AuthenticatedRequest extends Request {
    user?: {
        supabaseUserId: string;
        userId?: string | undefined;
        role?: UserRole;
        email?: string | undefined;
        schoolId?: string | undefined;
    };
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid authorization token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error("Supabase Auth Failed:", error?.message);
            return res.status(401).json({ message: "Invalid or expired token" });
        }


        const realRole = user.app_metadata?.role || user.user_metadata?.role || "authenticated";

        // 4. Attach to Request
        req.user = {
            supabaseUserId: user.id,
            email: user.email,
            role: realRole as UserRole,
        };

        next();

    } catch (err) {
        console.error("Middleware Logic Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}