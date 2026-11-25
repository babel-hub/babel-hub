import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import { PrincipalDashboardService } from "../application/PrincipalDashboardService.js";

export class PrincipalDashboardController {
    constructor(
        private readonly principalDashboardService: PrincipalDashboardService
    ) {}

    getDashboard = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const dashboard = await this.principalDashboardService.getDashboard(authUser);
            response.status(201).json({ dashboard });
        } catch (error) {
            next(error);
        }
    };
}