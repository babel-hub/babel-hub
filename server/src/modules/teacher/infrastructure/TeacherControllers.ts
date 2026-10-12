import type { TeacherServices } from "../application/TeacherServices.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { TeacherCreateCredentials, TeacherUpdateCredentials } from "../../shared/domain/Shared.types.js";

export class TeacherControllers {
    constructor(private readonly teacherServices: TeacherServices) {}

    getTeachers = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const available = request.query.available as string | undefined;
            const includeTeacherId = request.query.includeTeacherId as string | undefined;
            const isActive = true;

            const records = await this.teacherServices.getTeachers(available, includeTeacherId, isActive, authUser);
            response.status(200).json({ teachers: records });
        } catch (error) {
            next(error);
        }
    };

    getTeacherDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const teacherId = request.params.teacherId as string;

            const { teacher, classes } = await this.teacherServices.getTeacherDetails(teacherId, authUser);
            response.status(200).json({ teacher, classes });
        } catch (error) {
            next(error);
        }
    };

    getTeacherSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const teacherId = request.params.teacherId as string;

            const schedule = await this.teacherServices.getTeacherSchedule(teacherId, authUser);
            response.status(200).json({ schedule });
        } catch (error) {
            next(error);
        }
    };

    getTeacherCalendar = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const teacherId = request.params.teacherId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const calendar = await this.teacherServices.getTeacherCalendar(teacherId, startDate, endDate, authUser);
            response.status(200).json({ calendar });
        } catch (error) {
            next(error);
        }
    };

    createTeacher = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { email, password, firstName, middleName, firstLastName, secondLastName, userName, phone } = request.body;

            const credentials: TeacherCreateCredentials = {
                firstName, middleName, firstLastName, secondLastName,
                userName, phone, email, password
            };

            const teacher = await this.teacherServices.createTeacher(credentials, authUser);
            response.status(201).json({ teacher });
        } catch (error) {
            next(error);
        }
    };

    updateTeacher = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const teacherId = request.params.id as string;
            const { firstName, middleName, firstLastName, secondLastName, userName, phone } = request.body;

            const credentials: TeacherUpdateCredentials = {
                teacherId, firstName, middleName, firstLastName, secondLastName, userName, phone
            };

            await this.teacherServices.updateTeacher(credentials, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteTeacher = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const teacherId = request.params.id as string;

            await this.teacherServices.deleteTeacher(teacherId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}