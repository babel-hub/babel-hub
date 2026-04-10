import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 1. Log the error for the developer
    console.error("[SERVER ERROR]:", err.stack || err);

    // 2. Determine the status code
    // If the error has a 'status' property, use it; otherwise, default to 500
    const statusCode = err.status || 500;

    // 3. Send a clean response to the user
    res.status(statusCode).json({
        error: {
            message: `Error middleware: ${err.message}` || "An unexpected error occurred",
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        },
    });
};