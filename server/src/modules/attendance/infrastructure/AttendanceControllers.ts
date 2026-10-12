import type { AttendanceService } from "../application/AttendanceService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    getDailyClassAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;
            const date = request.query.date as string;
            const isActive = true;

            const records = await this.attendanceService.getDailyClassAttendance(classId, date, isActive, authUser);
            response.status(200).json({ date, records });
        } catch (error) {
            next(error);
        }
    };

    getDailyCourseAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const date = request.query.date as string;
            const isActive = true;

            const records = await this.attendanceService.getDailyCourseAttendance(courseId, date, isActive, authUser);
            response.status(200).json({ date, records });
        } catch (error) {
            next(error);
        }
    };

    getAttendanceSummary = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;
            const today = request.query.today as string;
            const isActive = true;

            const record = await this.attendanceService.getAttendanceSummary(today, startDate, endDate, isActive, authUser);
            response.status(200).json({ attendanceSummary: record });
        } catch (error) {
            next(error);
        }
    };

    getCalendarAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const studentId = request.query.studentId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const record = await this.attendanceService.getCalendarAttendance(studentId, startDate, endDate, authUser);
            response.status(200).json({ attendanceByCalendar: record });
        } catch (error) {
            next(error);
        }
    };

    getClassAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const classId = request.params.classId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const record = await this.attendanceService.getClassAttendance(courseId, classId, startDate, endDate, authUser);
            response.status(200).json({ attendanceClass: record });
        } catch (error) {
            next(error);
        }
    };

    bulkUpsertAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;
            const { date, records } = request.body;

            await this.attendanceService.bulkUpsertAttendance(classId, records, date, authUser);
            response.status(201).json({ message: "Successfully upserted attendance" });
        } catch (error) {
            next(error);
        }
    };
}