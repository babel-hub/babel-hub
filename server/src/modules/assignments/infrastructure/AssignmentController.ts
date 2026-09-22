import type { AssignmentService } from "../application/AssignmentService.js";
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";

export class AssignmentController {
    constructor( private readonly assignmentService: AssignmentService ) {}

    getAssignmentOverview = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const periodId = request.params.periodId as string;
            const courseId = request.query.courseId as string;
            const classId = request.query.classId as string;

            const userSchoolId = request.user!.schoolId as string;

            const records = await this.assignmentService.getAssignmentsOverview(courseId, classId, periodId, userSchoolId);
            response.status(200).json({ assignments: records });
        } catch (error) {
            next(error);
        }
    }

    createAssignment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { assignmentName, assignmentDueAt, classId, assessmentId, periodId } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role! as string,
                userSchoolId: request.user!.schoolId as string
            }

            await this.assignmentService.createAssignment(assignmentName, assignmentDueAt, classId, assessmentId, periodId, authUser);
            response.status(201).send();
        } catch (error: any) {
            next(error);
        }
    }

    updateAssignment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const assignmentId = request.params.assignmentId as string;
            const { assignmentName, assignmentDueAt } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role! as string,
                userSchoolId: request.user!.schoolId as string
            }

            await this.assignmentService.updateAssignment(
                assignmentId,
                { assignmentName, assignmentDueAt },
                authUser
            );

            response.status(200).send();
        } catch (error) {
            next(error);
        }
    }

    deleteAssignment = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const assignmentId = request.params.assignmentId as string;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role! as string,
                userSchoolId: request.user!.schoolId as string
            }

            await this.assignmentService.deleteAssignment(assignmentId, authUser);
            response.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}