import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    BulkUpsertGradesPayload,
    GetAccumulatedGradesBySubjectPayload,
    GradeByAssignment,
    GradeRecord,
    StudentDailyGrade,
    StudentGrade,
    StudentGradeRow,
    SubjectAccumulated
} from "./Grade.types.js";

export interface IGradeRepository {
    getGradesByClass(classId: string, authUser: AuthUser): Promise<GradeByAssignment[]>;
    getStudentProfileGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGradeRow[]>;
    getAccumulatedGradesBySubject(payload: GetAccumulatedGradesBySubjectPayload, authUser: AuthUser): Promise<SubjectAccumulated>;
    getStudentGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGrade[]>;
    getStudentDailyGrades(studentId: string, date: string, authUser: AuthUser): Promise<StudentDailyGrade[]>;
    bulkUpsertGrades(payload: BulkUpsertGradesPayload, authUser: AuthUser): Promise<void>;
}