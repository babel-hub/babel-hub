import type { ParentService } from "../application/ParentService.js";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";

export class ParentControllers {
    constructor (private readonly parentService: ParentService) {}

    getParents = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const userSchoolId = request.user!.schoolId as string;

            const parents = await this.parentService.getParents(userSchoolId);
            response.status(200).json({ parents });
        } catch (error : any) {
            next(error);
        }
    }

    getParentStudents = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            const student = await this.parentService.getParentStudents({ userId, userRole, userSchoolId });
            response.status(200).json({ student });
        } catch (error : any) {
            next(error);
        }
    }

    getStudentGrades = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const studentId = request.params.studentId as string;
            const periodId = request.params.periodId as string;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            const grades = await this.parentService.getStudentGrades(studentId, periodId, { userId, userRole, userSchoolId });
            response.status(200).json({ grades });
        } catch (error : any) {
            next(error);
        }
    }

    getStudentAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const studentId = request.params.studentId as string;

            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;
            const date = request.query.date as string;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            const attendance = await this.parentService.getStudentAttendance(studentId, { start: startDate, end: endDate, date }, { userId, userRole, userSchoolId });
            response.status(200).json({ attendance });
        } catch (error : any) {
            next(error);
        }
    }

    createParent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { email, password, firstName, middleName, firstLastName, secondLastName, userName, phone } = request.body;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            await this.parentService.createParent({ firstName, middleName, firstLastName, secondLastName, password, email, userName, phone }, { userId, userRole, userSchoolId });
            response.status(201).send();
        } catch (error : any) {
            next(error);
        }
    }

    linkParentToStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { parentId, studentId, relationshipType } = request.body;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            await this.parentService.linkedParentToStudent(parentId, studentId, relationshipType, { userId, userRole, userSchoolId });
            response.status(201).send();
        } catch (error : any) {
            next(error);
        }
    }

    deleteParent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const parentId = request.params.parentId as string;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            await this.parentService.deleteParent(parentId, { userId, userRole, userSchoolId });
            response.status(200).send();
        } catch (error : any) {
            next(error);
        }
    }
}