import type { AssignmentService } from "../application/AssignmentService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import type { CreateAssignmentPayload, UpdateAssignmentDTO } from "../domain/Assignment.types.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class AssignmentController {
    constructor(private readonly assignmentService: AssignmentService) {}

    getAssignmentOverview = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const periodId = request.params.periodId as string;
            const courseId = request.query.courseId as string;
            const classId = request.query.classId as string;

            const records = await this.assignmentService.getAssignmentsOverview(courseId, classId, periodId, authUser);
            response.status(200).json({ assignments: records });
        } catch (error) {
            next(error);
        }
    };

    createAssignment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { assignmentName, assignmentDueAt, classId, assessmentId, periodId } = request.body;

            const payload: CreateAssignmentPayload = {
                assignmentName, assignmentDueAt, classId, assessmentId, periodId
            };

            await this.assignmentService.createAssignment(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateAssignment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const assignmentId = request.params.assignmentId as string;
            const { assignmentName, assignmentDueAt } = request.body;

            const payload: UpdateAssignmentDTO = { assignmentName, assignmentDueAt };

            await this.assignmentService.updateAssignment(assignmentId, payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteAssignment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const assignmentId = request.params.assignmentId as string;

            await this.assignmentService.deleteAssignment(assignmentId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}