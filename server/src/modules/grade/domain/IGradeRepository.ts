import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { GradeByAssignment, GradeRecord, StudentDailyGrade, StudentGrade } from "./Grade.types.js";

export interface IGradeRepository {
    getGradesByClass(classId: string): Promise<GradeByAssignment[]>;
    getStudentGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGrade[]>;
    getStudentDailyGrades(studentId: string, date: string, authUser: AuthUser): Promise<StudentDailyGrade[]>;
    bulkUpsertGrades(assignmentId: string, records: GradeRecord[], authUser: AuthUser): Promise<void>;
}