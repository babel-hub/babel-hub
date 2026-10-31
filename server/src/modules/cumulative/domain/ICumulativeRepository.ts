import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    CourseFailStat,
    CoursePeriodTrend,
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary,
    GetCourseTrendPayload,
    GetCumulativeRecordPayload,
    HonorStudent,
    ReportCard,
    ReportStudentRow,
    StudentAcademicReportRow,
    StudentCourseSummaryRow
} from "./Cumulative.types.js";


export interface ICumulativeRepository {
    getCumulativeGrades(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeGrades[]>;
    getCumulativeAttendance(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeAttendance[]>;
    getCoursePeriodTrend(payload: GetCourseTrendPayload, authUser: AuthUser): Promise<CoursePeriodTrend[]>;
    getStudentReportCardData(studentId: string, authUser: AuthUser): Promise<StudentAcademicReportRow[]>;
    getStudentInfo(studentId: string, authUser: AuthUser): Promise<StudentCourseSummaryRow>;
    getCourseFailStats(courseId: string, periodId: string, authUser: AuthUser): Promise<CourseFailStat[]>;
    getCourseHonorStudents(courseId: string, periodId: string, authUser: AuthUser): Promise<HonorStudent[]>;
}