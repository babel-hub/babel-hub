import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../types/types.js";

// 1. Define the interface for the decoded JWT
interface AuthPayload extends JwtPayload {
    sub: string; // The supabase_user_id
    email?: string;
    role?: string;
    schoolId?: string;
}

// 2. Extend the standard Request to include our user
export interface AuthenticatedRequest extends Request {
    user?: {
        supabaseUserId: string;
        userId?: string | undefined;
        role?: UserRole;
        email?: string;
        schoolId?: string | undefined;
    };
}

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    // 3. Robust Environment Check
    // Prevents the app from running this check if the secret is missing
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
        console.error("FATAL: SUPABASE_JWT_SECRET is not defined.");
        return res.status(500).json({ message: "Internal Server Error" });
    }

    const authHeader = req.headers.authorization;

    // 4. Validate Header Format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid authorization token", response: req.headers  });
    }

    const token : any = authHeader.split(" ")[1];

    try {
        // 5. Explicit Algorithm Check
        // We enforce 'HS256' to prevent algorithm confusion attacks
        const decoded = jwt.verify(token, secret, {
            algorithms: ["HS256"],
        }) as AuthPayload;

        // 6. Attach user data
        console.log(decoded)
        req.user = {
            supabaseUserId: decoded.sub,
            role: decoded.role as UserRole, // Useful to pass the role along too
        };

        next();
    } catch (error) {
        console.log("Attempting verify with secret:", `|${secret}|`); // The pipes | show hidden spaces
        console.error("Auth Error:", error instanceof Error ? error.message : error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}