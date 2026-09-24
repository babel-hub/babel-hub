import type { ClassScheduleService } from "../application/ClassScheduleService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";

export class ClassScheduleControllers {
    constructor(private readonly classScheduleService: ClassScheduleService) {}

    createClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { classId, day, startTime, endTime, room } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string
            };

            await this.classScheduleService.createClassSchedule(classId, { day, startTime, endTime, room }, authUser);
            response.status(201).send();
        } catch (error : any) {
            next(error);
        }
    }

    updateClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const scheduleId = request.params.scheduleId as string;
            const { classId, day, startTime, endTime, room } = request.body;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string
            };

            await this.classScheduleService.updateClassSchedule(scheduleId, { class_id: classId, day, startTime, endTime, room }, authUser);
            response.status(200).send();
        } catch (error : any) {
            next(error);
        }
    }

    deleteClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const scheduleId = request.params.scheduleId as string;

            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string
            };

            await this.classScheduleService.deleteClassSchedule(scheduleId, authUser);
            response.status(200).send();
        } catch (error : any) {
            next(error);
        }
    }
}