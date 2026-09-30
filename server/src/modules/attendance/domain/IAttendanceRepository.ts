import type {
    AttendanceSummary,
    CalendarAttendance,
    ClassAttendance,
    CourseAttendance,
    CourseDailyAttendance,
    BulkRecords,
    DailyAttendance
} from "./Attendance.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IAttendanceRepository {
    getDailyClassAttendance(classId: string, schoolId: string, date: string, isActive: boolean): Promise<ClassAttendance[]>;
    getDailyCourseAttendance(courseId: string, schoolId: string, date: string, isActive: boolean): Promise<CourseDailyAttendance[]>;
    getClassAttendance(courseId: string, classId: string, schoolId: string, startDate: string, endDate: string): Promise<CourseAttendance[]>;
    getCalendarAttendance(studentId: string, schoolId: string, startDate: string, endDate: string): Promise<CalendarAttendance[]>;
    getStudentDailyAttendance(studentId: string, schoolId: string, date: string, authUser: AuthUser): Promise<DailyAttendance[]>;
    getAttendanceSummary(schoolId: string, today: string, startDate: string, endDate: string, isActive: boolean): Promise<AttendanceSummary[]>;
    bulkUpsertAttendance(classId: string, records: BulkRecords[], date: string, authUser: AuthUser): Promise<void>;
}