import type { ClassService } from "../application/ClassService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";

export class ClassControllers {
    constructor(private readonly classServices: ClassService) {}

    getClassDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const id = request.params.id as string;
            const schoolId = request.user!.schoolId as string;
            const isActive = true;

            const records = await this.classServices.getClassDetails(id, schoolId, isActive);
            response.status(200).json(records);
        } catch (error: any) {
            next(error);
        }
    }

    createClass = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { courseId, subjectId, teacherId } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const record = await this.classServices.createClass(courseId, subjectId, teacherId, authUser);

            response.status(201).json({ classId: record });
        } catch (error: any) {
            next(error);
        }
    }

    updateClass = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const classId = request.params.classId as string;
            const { newTeacher } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            await this.classServices.updateClass(classId, newTeacher, authUser);

            response.status(200).json({ message: "Clase actualizada exitosamente" });
        } catch (error: any) {
            next(error);
        }
    }

    deleteClass = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const classId = request.params.classId as string;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            await this.classServices.deleteClass(classId, authUser);

            response.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }

    getTeacherClasses = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const teacherId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;
            const isActive = true;

            const records = await this.classServices.getTeacherClasses(teacherId, userSchoolId, isActive);
            response.status(200).json({ teacherClasses: records });
        } catch (error: any) {
            next(error);
        }
    }

    getTeacherClassDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const classId = request.params.classId as string;

            const teacherId = request.user!.userId as string;
            const userSchoolId = request.user!.schoolId as string;

            const records = await this.classServices.getTeacherClassDetails(classId, teacherId, userSchoolId);
            response.status(200).json({ teacherClass: records });
        } catch (error: any) {
            next(error);
        }
    }
}