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

            await this.classScheduleService.createClassSchedule(classId, day, startTime, endTime, room, authUser);
            response.status(201).send();
        } catch (error : any) {
            next(error);
        }
    }
}