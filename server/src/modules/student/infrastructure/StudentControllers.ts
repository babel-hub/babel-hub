import type { StudentService } from "../application/StudentService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { StudentCreateCredentials, StudentUpdateCredentials } from "../../shared/domain/Shared.types.js";

export class StudentControllers {
    constructor(private readonly studentService: StudentService) {}

    getStudents = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const isActive = true;

            const records = await this.studentService.getStudents(isActive, authUser);
            response.status(200).json({ students: records });
        } catch (error) {
            next(error);
        }
    };

    getStudentDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.params.id as string;
            const periodId = request.query.periodId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const studentProfile = await this.studentService.getStudentDetails(
                studentId, periodId, startDate, endDate, authUser
            );
            response.status(200).json({ studentProfile });
        } catch (error) {
            next(error);
        }
    };

    getStudentsByName = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const query = request.query.q as string;
            const limit = parseInt(request.query.limit as string, 10) || 10;

            const students = await this.studentService.getStudentsByName(query, limit, authUser);
            response.status(200).json({ students });
        } catch (error) {
            next(error);
        }
    };

    createStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { email, password, firstName, middleName, firstLastName, secondLastName,
                enrollmentCode, courseId, userName, phone } = request.body;

            const credentials: StudentCreateCredentials = {
                email, password, firstName, middleName, firstLastName, secondLastName,
                enrollmentCode, courseId, userName, phone
            };

            const student = await this.studentService.createStudent(credentials, authUser);
            response.status(201).json({ student });
        } catch (error) {
            next(error);
        }
    };

    updateStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.params.id as string;
            const { firstName, middleName, firstLastName, secondLastName,
                enrollmentCode, courseId, userName, phone } = request.body;

            const credentials: StudentUpdateCredentials = {
                studentId, courseId, firstName, middleName, firstLastName, secondLastName,
                enrollmentCode, userName, phone
            };

            await this.studentService.updateStudent(credentials, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.params.id as string;

            await this.studentService.deleteStudent(studentId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}