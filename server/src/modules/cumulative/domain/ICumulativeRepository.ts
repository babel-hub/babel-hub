import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    CoursePeriodTrend,
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary,
    GetCourseTrendPayload,
    GetCumulativeRecordPayload, ReportCard, ReportStudentRow, StudentAcademicReportRow, StudentCourseSummaryRow
} from "./Cumulative.types.js";


export interface ICumulativeRepository {
    getCumulativeGrades(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeGrades[]>;
    getCumulativeAttendance(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeAttendance[]>;
    getCumulativeSummary(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeSummary[]>;
    getCoursePeriodTrend(payload: GetCourseTrendPayload, authUser: AuthUser): Promise<CoursePeriodTrend[]>;
    getStudentReportCardData(studentId: string, authUser: AuthUser): Promise<StudentAcademicReportRow[]>;
    getStudentInfo(studentId: string, authUser: AuthUser): Promise<StudentCourseSummaryRow>;
    getStudentsForReports(courseId: string, authUser: AuthUser): Promise<ReportStudentRow[]>;
}