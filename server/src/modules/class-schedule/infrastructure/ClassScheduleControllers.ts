import type { ClassScheduleService } from "../application/ClassScheduleService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";

export class ClassScheduleControllers {
    constructor(private readonly classScheduleService: ClassScheduleService) {}

    createClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { classId, day, startTime, endTime, room } = request.body;

            const userId = request.user!.userId as string;
            const userRole = request.user!.role as string;
            const userSchoolId = request.user!.schoolId as string;

            console.log(classId, day, startTime, endTime, room);

            await this.classScheduleService.createClassSchedule(classId, day, startTime, endTime, room, { userId, userRole, userSchoolId });
            response.status(201).send();
        } catch (error : any) {
            next(error);
        }
    }
}