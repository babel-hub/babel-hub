import type { AssessmentService } from "../application/AssessmentService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreateAssessmentPayload, UpdateAssessmentPayload } from "../domain/Assessment.types.js";

export class AssessmentController {
    constructor(private readonly assessmentService: AssessmentService) {}

    getAssessments = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const records = await this.assessmentService.getAssessments(authUser);
            response.status(200).json({ assessments: records });
        } catch (error) {
            next(error);
        }
    };

    createAssessment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { name, weight, gradingTemplateId } = request.body;

            const payload: CreateAssessmentPayload = {
                assessmentName: name,
                assessmentWeight: weight,
                gradingTemplateId
            };

            await this.assessmentService.createAssessment(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateAssessment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const assessmentId = request.params.assessmentId as string;
            const { name, weight, gradingTemplateId } = request.body;

            const payload: UpdateAssessmentPayload = {
                assessmentId,
                assessmentName: name,
                assessmentWeight: weight,
                gradingTemplateId
            };

            await this.assessmentService.updateAssessment(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteAssessment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const assessmentId = request.params.assessmentId as string;

            await this.assessmentService.deleteAssessment(assessmentId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}