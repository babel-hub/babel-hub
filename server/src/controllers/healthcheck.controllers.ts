import type { Response, Request } from "express";

export async function healthcheck(
    request: Request,
    response: Response) {
    response.status(200).json({
        status: "OK",
    });
}