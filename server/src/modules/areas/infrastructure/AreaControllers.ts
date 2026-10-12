import type { AreaService } from "../application/AreaService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreateAreaPayload, UpdateAreaPayload } from "../domain/Areas.types.js";


export class AreaControllers {
    constructor(private readonly areaService: AreaService) {}

    getAreas = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const records = await this.areaService.getAreas(authUser);
            response.status(200).json({ areas: records });
        } catch (error) {
            next(error);
        }
    };

    getAreaDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const id = request.params.id as string;

            const record = await this.areaService.getAreaDetails(id, authUser);
            response.status(200).json({ areaDetails: record });
        } catch (error) {
            next(error);
        }
    };

    createArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { name } = request.body;

            const payload: CreateAreaPayload = { name };
            await this.areaService.createArea(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const areaId = request.params.id as string;
            const { name } = request.body;

            const payload: UpdateAreaPayload = { areaId, name };
            await this.areaService.updateArea(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const id = request.params.id as string;

            await this.areaService.deleteArea(id, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}