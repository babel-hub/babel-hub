import type { ClassService } from "../application/ClassService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreateClassPayload } from "../domain/Classes.types.js";

export class ClassControllers {
    constructor(private readonly classServices: ClassService) {}

    getClassDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.id as string;
            const isActive = true;

            const records = await this.classServices.getClassDetails(classId, isActive, authUser);
            response.status(200).json(records);
        } catch (error) {
            next(error);
        }
    };

    createClass = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { courseId, subjectId, teacherId } = request.body;

            const payload: CreateClassPayload = { courseId, subjectId, teacherId };
            await this.classServices.createClass(payload, authUser);

            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateClass = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;
            const { newTeacher } = request.body;

            await this.classServices.updateClass(classId, newTeacher, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteClass = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;

            await this.classServices.deleteClass(classId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    getTeacherClasses = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const teacherId = authUser.userId;
            const isActive = true;

            const records = await this.classServices.getTeacherClasses(teacherId, isActive, authUser);
            response.status(200).json({ teacherClasses: records });
        } catch (error) {
            next(error);
        }
    };

    getTeacherClassDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;
            const teacherId = authUser.userId;

            const records = await this.classServices.getTeacherClassDetails(classId, teacherId, authUser);
            response.status(200).json({ teacherClass: records });
        } catch (error) {
            next(error);
        }
    };
}