import type { StudentService } from "../application/StudentService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from 'express';

export class StudentControllers {
    constructor( private readonly studentService: StudentService ) {}

    getStudents = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const userSchoolId = request.user!.schoolId as string;
            const isActive = true;

            const records = await this.studentService.getStudents(userSchoolId, isActive);
            response.status(200).json({ students: records });
        } catch (error : any) {
            next(error)
        }
    }

    getStudentDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const studentId = request.params.id as string;

            const periodId = request.query.periodId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const userSchoolId = request.user!.schoolId as string;

            const studentProfile = await this.studentService.getStudentDetails(
                studentId,
                periodId,
                startDate,
                endDate,
                userSchoolId
            );

            response.status(200).json({ studentProfile });
        } catch (error: any) {
            next(error);
        }
    }

    getStudentsByName = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const query = request.query.q as string;
            const limit = parseInt(request.query.limit as string, 10) || 10;

            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;
            const userId = request.user!.userId as string;

            const students = await this.studentService.getStudentsByName(query, { userSchoolId, userRole, userId }, limit);
            response.status(200).json({ students });
        } catch (error : any) {
            next(error);
        }
    }

    createStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { email, password, firstName, middleName, firstLastName, secondLastName, enrollmentCode, courseId, userName, phone } = request.body;

            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;
            const userId = request.user!.userId as string;

            const record = await this.studentService.createStudent({ courseId, firstName, middleName, firstLastName, secondLastName, enrollmentCode, email, password, phone, userName }, { userId, userRole, userSchoolId });
            response.status(201).json({ student: record });
        } catch (error : any) {
            next(error)
        }
    }

    updateStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;
            const { firstName, middleName, firstLastName, secondLastName, enrollmentCode, courseId, userName, phone } = request.body;

            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;
            const userId = request.user!.userId as string;

            await this.studentService.updateStudent({ studentId: id, courseId, firstName, middleName, firstLastName, secondLastName, enrollmentCode, userName, phone }, { userId, userRole, userSchoolId });
            response.status(204).send();
        } catch (error : any) {
            next(error)
        }
    }

    deleteStudent = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;

            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;
            const userId = request.user!.userId as string;

            await this.studentService.deleteStudent(id, userId, userRole, userSchoolId);
            response.status(204).send();
        } catch (error : any) {
            next(error)
        }
    }
}