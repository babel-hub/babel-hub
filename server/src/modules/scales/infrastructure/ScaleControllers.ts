import type { ScaleService } from "../application/ScaleService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class ScaleControllers {
    constructor(private readonly scaleService: ScaleService) {}

    getScales = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const records = await this.scaleService.getScales(authUser);
            response.status(200).json({ scales: records });
        } catch (error) {
            next(error);
        }
    };

    getClassScale = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;

            const records = await this.scaleService.getClassScale(classId, authUser);
            response.status(200).json({ scale: records });
        } catch (error) {
            next(error);
        }
    };
}