import type {
    AttendanceSummary,
    CalendarAttendance,
    ClassAttendance, CourseAttendance,
    CourseDailyAttendance, BulkRecords, DailyAttendance
} from "./Attendance.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";


export interface IAttendanceRepository {
    getDailyClassAttendance(classId: string, schoolId: string, date:string, isActive: boolean): Promise<ClassAttendance[]>;
    getDailyCourseAttendance(courseId: string, schoolId: string, date: string, isActive:boolean): Promise<CourseDailyAttendance[]>;
    bulkUpsertAttendance(classId: string, records: BulkRecords[], date: string, userId: string, userRole: string, userSchoolId: string): Promise<void>
    getAttendanceSummary(schoolId: string, startDate: string, endDate: string, isActive: boolean): Promise<AttendanceSummary[]>
    getCalendarAttendance(studentId: string, startDate: string, endDate: string): Promise<CalendarAttendance[]>;
    getClassAttendance(courseId: string, classId: string, startDate: string, endDate: string): Promise<CourseAttendance[]>;
    getStudentDailyAttendance(studentId: string, date: string, authUser: AuthUser): Promise<DailyAttendance[]>
}