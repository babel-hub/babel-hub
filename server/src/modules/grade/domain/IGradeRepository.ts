import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    GradeByAssignment,
    GradeRecord,
    StudentDailyGrade,
    StudentGrade, StudentGradeRow,
    SubjectAccumulated
} from "./Grade.types.js";

export interface IGradeRepository {
    getGradesByClass(classId: string): Promise<GradeByAssignment[]>;
    getStudentProfileGrades(studentId: string, periodId: string): Promise<StudentGradeRow[]>;
    getAccumulatedGradesBySubject(studentId: string, classId: string, periodId: string, subjectName: string, authUser: AuthUser): Promise<SubjectAccumulated>;
    getStudentGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGrade[]>;
    getStudentDailyGrades(studentId: string, date: string, authUser: AuthUser): Promise<StudentDailyGrade[]>;
    bulkUpsertGrades(assignmentId: string, records: GradeRecord[], authUser: AuthUser): Promise<void>;
}