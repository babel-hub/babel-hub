import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/types.js";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export interface AuthenticatedRequest extends Request {
    user?: {
        supabaseUserId: string;
        userId?: string | undefined;
        role?: UserRole;
        email?: string | undefined;
        schoolId?: string | undefined;
    };
}

interface SupabaseJwtPayload {
    sub: string;
    email?: string;
    app_metadata?: { role?: string; [key: string]: any };
    user_metadata?: { role?: string; [key: string]: any };
    exp: number;
}

let client: jwksClient.JwksClient | null = null;

function getJwksClient() {
    if (!client) {
        if (!process.env.SUPABASE_URL) {
            throw new Error("SUPABASE_URL is not defined in your .env file");
        }
        const jwksUri = `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;

        client = jwksClient({
            jwksUri: jwksUri,
            cache: true,
            cacheMaxAge: 60 * 60 * 1000,
            rateLimit: true,
        });
    }
    return client;
}

function getKey(header: jwt.JwtHeader, callback: any) {
    if (!header.kid) {
        callback(new Error("Missing kid in JWT header"));
        return;
    }

    getJwksClient().getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });

}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid authorization token" });
        return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Missing or invalid token" });
        return;
    }

    try {
        const decoded = await new Promise<SupabaseJwtPayload>((resolve, reject) => {
            jwt.verify(token, getKey, {
                algorithms: ["ES256"],
                audience: "authenticated",
                issuer: `${process.env.SUPABASE_URL}/auth/v1`
            }, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded as SupabaseJwtPayload);
            });
        });

        req.user = {
            supabaseUserId: decoded.sub,
        };

        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: "El token expiro." });
            return;
        }

        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ message: "Token invalido." });
        return;
    }
}