import type { PeriodService } from "../application/PeriodServices.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from 'express';

export class PeriodControllers {
    constructor(private readonly periodService: PeriodService) {}

    getPeriods = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const userSchoolId = request.user!.schoolId as string;

            const records = await this.periodService.getPeriods(userSchoolId);
            response.status(200).json({ periods: records });
        } catch (error: any) {
            next(error);
        }
    }

    createPeriod = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { name, startDate, endDate } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const record = await this.periodService.createPeriod(name, startDate, endDate, authUser);
            response.status(201).send();
        } catch (error: any) {
            next(error);
        }
    }

    updatePeriod = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;
            const { name, startDate, endDate } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const record = await this.periodService.updatePeriod(id, name, startDate, endDate, authUser);
            response.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }

    deletePeriod = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            await this.periodService.deletePeriod(id, authUser);
            response.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }
}