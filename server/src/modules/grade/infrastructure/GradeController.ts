import type { GradeService } from "../application/GradeService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class GradeController {
    constructor(private readonly gradeService: GradeService) {}

    bulkUpsertGrades = async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = getAuthUser(request);
            const assignmentId = request.params.assignmentId as string;
            const classId = request.params.classId as string;
            const { records } = request.body;

            await this.gradeService.bulkUpsertGrades(classId, assignmentId, records, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };
}