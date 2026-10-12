import type { GradingTemplateService } from "../application/GradingTemplateService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import type {
    CreateGradingTemplatePayload,
    UpdateGradingTemplatePayload
} from "../domain/GradingTemplate.types.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class GradingTemplateController {
    constructor(private readonly gradingTemplateService: GradingTemplateService) {}

    getGradingTemplates = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const records = await this.gradingTemplateService.getGradingTemplates(authUser);
            response.status(200).json({ gradings: records });
        } catch (error) {
            next(error);
        }
    };

    getGradingTemplateDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const gradingId = request.params.gradingId as string;

            const records = await this.gradingTemplateService.getGradingTemplateDetails(gradingId, authUser);
            response.status(200).json({ gradings_details: records });
        } catch (error) {
            next(error);
        }
    };

    createGradingTemplate = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { name, scaleId } = request.body;

            const payload: CreateGradingTemplatePayload = {
                gradingName: name,
                gradingScaleId: scaleId
            };

            await this.gradingTemplateService.createGradingTemplate(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateGradingTemplate = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const gradingId = request.params.gradingId as string;
            const { name, scaleId } = request.body;

            const payload: UpdateGradingTemplatePayload = {
                gradingId,
                gradingName: name,
                gradingScaleId: scaleId
            };

            await this.gradingTemplateService.updateGradingTemplate(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteGradingTemplate = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const gradingId = request.params.gradingId as string;

            await this.gradingTemplateService.deleteGradingTemplate(gradingId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}