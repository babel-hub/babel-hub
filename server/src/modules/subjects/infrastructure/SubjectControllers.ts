import type { SubjectServices } from "../application/SubjectServices.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreateSubjectPayload, UpdateSubjectPayload } from "../domain/Subjects.types.js";

export class SubjectControllers {
    constructor(private readonly subjectServices: SubjectServices) {}

    getSubjectsByArea = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const areaId = request.params.areaId as string;

            const records = await this.subjectServices.getSubjectsByArea(areaId, authUser);
            response.status(200).json({ subjects: records });
        } catch (error) {
            next(error);
        }
    };

    getAvailableSubjects = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.query.courseId as string;

            const records = await this.subjectServices.getAvailableSubjects(courseId, authUser);
            response.status(200).json({ availableSubjects: records });
        } catch (error) {
            next(error);
        }
    };

    createSubject = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { name, areaId, gradingTemplateId } = request.body;

            const payload: CreateSubjectPayload = {
                subjectName: name,
                subjectAreaId: areaId,
                gradingTemplateId
            };

            const subject = await this.subjectServices.createSubject(payload, authUser);
            response.status(201).json({ subject });
        } catch (error) {
            next(error);
        }
    };

    updateSubject = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const subjectId = request.params.id as string;
            const { name, areaId, gradingTemplateId } = request.body;

            const payload: UpdateSubjectPayload = {
                subjectId,
                subjectName: name,
                subjectAreaId: areaId,
                gradingTemplateId
            };

            await this.subjectServices.updateSubject(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteSubject = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const subjectId = request.params.id as string;

            await this.subjectServices.deleteSubject(subjectId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}