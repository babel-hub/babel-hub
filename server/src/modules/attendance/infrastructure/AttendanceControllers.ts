import type { AttendanceService } from "../application/AttendanceService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";

export class AttendanceController {
    constructor( private readonly attendanceService: AttendanceService ) {}

    getDailyClassAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const classId = request.params.classId as string;
            const schoolId = request.user!.schoolId as string;
            const date = request.query.date as string;
            const isActive = true;

            const records = await this.attendanceService.getDailyClassAttendance(classId, schoolId, date, isActive);
            response.status(200).json({ date, records });
        } catch (error : any) {
            next(error)
        }
    }

    getDailyCourseAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user!.schoolId as string;

            const courseId = request.params.courseId as string;
            const date = request.query.date as string;
            const isActive = true;

            const records = await this.attendanceService.getDailyCourseAttendance(courseId, schoolId, date, isActive);

            response.status(200).json({ date, records });
        } catch (error : any) {
            next(error)
        }
    }

    bulkUpsertAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = {
                userId: request.user!.userId as string,
                userRole: request.user!.role as string,
                userSchoolId: request.user!.schoolId as string,
            };

            const classId = request.params.classId as string;
            const { date, records } = request.body;

            await this.attendanceService.bulkUpsertAttendance(classId, records, date, authUser);
            response.status(201).json({ message: "Successfully upserted attendance" });
        } catch (error : any) {
            next(error)
        }
    }

    getAttendanceSummary = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user!.schoolId as string;

            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;
            const today = request.query.today as string;
            const isActive = true;

            const record = await this.attendanceService.getAttendanceSummary(schoolId, today, startDate, endDate, isActive);
            response.status(200).json({ attendanceSummary: record });
        } catch (error : any) {
            next(error)
        }
    }

    getCalendarAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user!.schoolId as string;

            const studentId = request.query.studentId as string;
            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const record = await this.attendanceService.getCalendarAttendance(studentId, schoolId, startDate, endDate);
            response.status(200).json({ attendanceByCalendar: record });
        } catch (error : any) {
            next(error)
        }
    }

    getClassAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user!.schoolId as string;

            const courseId = request.params.courseId as string;
            const classId = request.params.classId as string;

            const startDate = request.query.startDate as string;
            const endDate = request.query.endDate as string;

            const record = await this.attendanceService.getClassAttendance(courseId, classId, schoolId, startDate, endDate);
            response.status(200).json({ attendanceClass: record });
        } catch (error : any) {
            next(error)
        }
    }
}