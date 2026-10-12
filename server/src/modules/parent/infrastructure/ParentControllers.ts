import type { ParentService } from "../application/ParentService.js";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { RelationTypes } from "../domain/Parent.types.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { ParentCredentials } from "../../shared/domain/Shared.types.js";

export class ParentControllers {
    constructor(private readonly parentService: ParentService) {}

    getParents = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const parents = await this.parentService.getParents(authUser);
            response.status(200).json({ parents });
        } catch (error) {
            next(error);
        }
    };

    getAccumulatedGradesBySubject = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.params.studentId as string;
            const classId = request.query.classId as string;
            const periodId = request.query.periodId as string;
            const subjectName = request.query.subjectName as string;

            const accumulated = await this.parentService.getAccumulatedGradesBySubject(
                studentId, classId, periodId, subjectName, authUser
            );
            response.status(200).json({ accumulated });
        } catch (error) {
            next(error);
        }
    };

    getParentStudents = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const students = await this.parentService.getParentStudents(authUser);
            response.status(200).json({ students });
        } catch (error) {
            next(error);
        }
    };

    getStudentGrades = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.params.studentId as string;
            const periodId = request.params.periodId as string;

            const grades = await this.parentService.getStudentGrades(studentId, periodId, authUser);
            response.status(200).json({ grades });
        } catch (error) {
            next(error);
        }
    };

    getStudentDailyGrades = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.params.studentId as string;
            const date = request.query.date as string;

            const grades = await this.parentService.getStudentDailyGrades(studentId, date, authUser);
            response.status(200).json({ grades });
        } catch (error) {
            next(error);
        }
    };

    getStudentDailyAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.query.courseId as string;
            const studentId = request.params.studentId as string;
            const date = request.query.date as string;

            const timeline = await this.parentService.getStudentDailyAttendance(courseId, studentId, date, authUser);
            response.status(200).json({ timeline });
        } catch (error) {
            next(error);
        }
    };

    createParent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { email, password, firstName, middleName, firstLastName, secondLastName, userName, phone } = request.body;

            const credentials: ParentCredentials = {
                firstName, middleName, firstLastName, secondLastName,
                userName, phone, email, password
            };

            await this.parentService.createParent(credentials, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    linkParentToStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { parentId, studentId, relationshipType } = request.body;

            await this.parentService.linkParentToStudent(
                parentId, studentId, relationshipType as RelationTypes, authUser
            );
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    deleteParent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const parentId = request.params.parentId as string;

            await this.parentService.deleteParent(parentId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteParentStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const linkId = request.params.id as string;

            await this.parentService.deleteParentStudent(linkId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}