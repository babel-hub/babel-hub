import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    AttendanceSummary,
    CalendarAttendance,
    ClassAttendance,
    CourseAttendance,
    CourseDailyAttendance,
    DailyAttendance, GetDailyClassAttendancePayload,
    GetDailyCourseAttendancePayload,
    GetClassAttendancePayload, GetCalendarAttendancePayload, GetAttendanceSummaryPayload, BulkUpsertAttendancePayload
} from "./Attendance.types.js";

export interface IAttendanceRepository {
    getDailyClassAttendance(payload: GetDailyClassAttendancePayload, authUser: AuthUser): Promise<ClassAttendance[]>;
    getDailyCourseAttendance(payload: GetDailyCourseAttendancePayload, authUser: AuthUser): Promise<CourseDailyAttendance[]>;
    getClassAttendance(payload: GetClassAttendancePayload, authUser: AuthUser): Promise<CourseAttendance[]>;
    getCalendarAttendance(payload: GetCalendarAttendancePayload, authUser: AuthUser): Promise<CalendarAttendance[]>;
    getStudentDailyAttendance(studentId: string, date: string, authUser: AuthUser): Promise<DailyAttendance[]>;
    getAttendanceSummary(payload: GetAttendanceSummaryPayload, authUser: AuthUser): Promise<AttendanceSummary[]>;
    bulkUpsertAttendance(payload: BulkUpsertAttendancePayload, authUser: AuthUser): Promise<void>;

    // Dashboard interfaces
    getAttendanceAlerts(limit: number, authUser: AuthUser): Promise<AttendanceSummary[]>;
}