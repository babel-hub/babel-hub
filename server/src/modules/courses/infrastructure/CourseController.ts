import type { CourseService } from "../application/CourseService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import type {
    CreateCoursePayload,
    UpdateCoursePayload
} from "../domain/Course.types.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    getCourses = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const isActive = true;

            const records = await this.courseService.getCourses(isActive, authUser);
            response.status(200).json({ courses: records });
        } catch (error) {
            next(error);
        }
    };

    getCourseDetails = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.id as string;
            const isActive = true;

            const { course, students, classes } = await this.courseService.getCourseDetails(courseId, isActive, authUser);
            response.status(200).json({ course, students, classes });
        } catch (error) {
            next(error);
        }
    };

    createCourse = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { name, year, teacherId } = request.body;

            const payload: CreateCoursePayload = {
                courseName: name,
                courseYear: year,
                courseTeacherId: teacherId
            };

            await this.courseService.createCourse(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateCourse = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.id as string;
            const { name, year, teacherId } = request.body;

            const payload: UpdateCoursePayload = {
                courseId,
                courseName: name,
                courseYear: year,
                courseTeacherId: teacherId
            };

            await this.courseService.updateCourse(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteCourse = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.id as string;

            await this.courseService.deleteCourse(courseId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    getTeacherCourse = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);

            const record = await this.courseService.getTeacherCourse(authUser);
            response.status(200).json({ teacherCourse: record });
        } catch (error) {
            next(error);
        }
    };
}