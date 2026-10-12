import type { PeriodService } from "../application/PeriodServices.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreatePeriodPayload, UpdatePeriodPayload } from "../domain/Period.types.js";

export class PeriodControllers {
    constructor(private readonly periodService: PeriodService) {}

    getPeriods = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const records = await this.periodService.getPeriods(authUser);
            response.status(200).json({ periods: records });
        } catch (error) {
            next(error);
        }
    };

    createPeriod = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { name, startDate, endDate } = request.body;

            const payload: CreatePeriodPayload = {
                periodName: name,
                startDate,
                endDate
            };

            await this.periodService.createPeriod(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updatePeriod = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const periodId = request.params.id as string;
            const { name, startDate, endDate } = request.body;

            const payload: UpdatePeriodPayload = {
                periodId,
                periodName: name,
                startDate,
                endDate
            };

            await this.periodService.updatePeriod(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deletePeriod = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const periodId = request.params.id as string;

            await this.periodService.deletePeriod(periodId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}