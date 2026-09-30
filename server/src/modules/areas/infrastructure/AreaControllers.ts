import type { AreaService } from "../application/AreaService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from 'express';

export class AreaControllers {
    constructor(private readonly areaService: AreaService) {}

    getAreas = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user!.schoolId as string;

            const records = await this.areaService.getAreas(schoolId);
            response.status(200).json({ areas: records });
        } catch (error: any) {
            next(error);
        }
    }

    getAreaDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user!.schoolId as string;
            const id = request.params.id as string;

            const record = await this.areaService.getAreaDetails(id, schoolId);
            response.status(200).json({ areaDetails: record });
        } catch (error: any) {
            next(error);
        }
    }

    createArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const { name } = request.body;

            const newArea = await this.areaService.createArea(name, authUser);

            response.status(201).json({
                message: "Área creada exitosamente",
                area: newArea
            });
        } catch (error: any) {
            next(error);
        }
    }

    updateArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const id = request.params.id as string;
            const { name } = request.body;

            const updatedArea = await this.areaService.updateArea(id, name, authUser);

            response.status(200).json({ area: updatedArea });
        } catch (error: any) {
            next(error);
        }
    }

    deleteArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const id = request.params.id as string;

            await this.areaService.deleteArea(id, authUser);

            response.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }
}