import type { ClassScheduleService } from "../application/ClassScheduleService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import type { UpdateSchedule, UpsertSchedule } from "../domain/ClassSchedule.types.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class ClassScheduleControllers {
    constructor(private readonly classScheduleService: ClassScheduleService) {}

    createClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { classId, day, startTime, endTime, room } = request.body;

            const schedule: UpsertSchedule = { day, startTime, endTime, room };

            await this.classScheduleService.createClassSchedule(classId, schedule, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const scheduleId = request.params.scheduleId as string;
            const { classId, day, startTime, endTime, room } = request.body;

            const schedule: UpdateSchedule = {
                class_id: classId,
                day,
                startTime,
                endTime,
                room
            };

            await this.classScheduleService.updateClassSchedule(scheduleId, schedule, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteClassSchedule = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const scheduleId = request.params.scheduleId as string;

            await this.classScheduleService.deleteClassSchedule(scheduleId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}