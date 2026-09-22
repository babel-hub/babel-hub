import type { TeacherServices } from "../application/TeacherServices.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";

export class TeacherControllers {
    constructor( private readonly teacherServices : TeacherServices ) {}

    getTeachers = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const available = request.query.available as string | undefined;
            const includeTeacherId = request.query.includeTeacherId as string | undefined;
            const isActive = true;

            const userSchoolId = request.user!.schoolId as string;

            const records = await this.teacherServices.getTeachers(userSchoolId, available, includeTeacherId, isActive);
            response.status(200).json({ teachers: records });
        } catch (error : any) {
            next(error);
        }
    }

    getTeacherDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;

            const userSchoolId = request.user!.schoolId as string;

            const { teacher, classes } = await this.teacherServices.getTeacherDetails(id, userSchoolId);
            response.status(200).json({ teacher, classes });
        } catch (error : any) {
            next(error);
        }
    }

    getTeacherSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const teacherId = request.params.teacherId as string;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string
            };

            const schedule = await this.teacherServices.getTeacherSchedule(teacherId, authUser);
            response.status(200).json({ schedule });
        } catch (error : any) {
            next(error);
        }
    }

    getTeacherCalendar = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const teacherId = request.params.teacherId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string
            };

            const calendar = await this.teacherServices.getTeacherCalendar(teacherId, startDate, endDate, authUser);
            response.status(200).json({ calendar });
        } catch (error : any) {
            next(error)
        }
    }

    createTeacher = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { email, password, firstName, middleName, firstLastName, secondLastName, userName, phone } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string
            };

            const record = await this.teacherServices.createTeacher({ firstName, middleName, firstLastName, secondLastName, password, email, userName, phone }, authUser);
            response.status(201).json({ teacher: record });
        } catch (error : any) {
            next(error);
        }
    }

    updateTeacher = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;

            const { firstName, middleName, firstLastName, secondLastName, userName, phone } = request.body;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            await this.teacherServices.updateTeacher({ teacherId: id, firstName, middleName, firstLastName, secondLastName, userName, phone }, {userId, userRole, userSchoolId});
            response.status(204).send();
        } catch (error : any) {
            next(error);
        }
    }

    deleteTeacher = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;

            const userId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const userRole = request.user!.role as string;

            await this.teacherServices.deleteTeacher(id, userId, userRole, userSchoolId);
            response.status(204).send();
        } catch (error : any) {
            next(error);
        }
    }
}