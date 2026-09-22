import type {AssignmentsByTeacherAndDate, AssignmentsOverview, UpdateAssignmentDTO} from "./Assignment.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IAssignmentRepository {
    getAssignmentsOverview(courseId: string, classId: string, periodId: string, userSchoolId: string): Promise<AssignmentsOverview>;
    getAssignmentsByTeacherAndDate(teacherProfileId: string, startDate: string, endDate: string): Promise<AssignmentsByTeacherAndDate[]>;
    getAssignmentOwner(assignmentId: string): Promise<string | null>;
    createAssignment(
        assignmentName: string,
        assignmentDueAt: string,
        classId: string,
        assessmentId: string,
        periodId: string,
        authUser: AuthUser): Promise<void>;
    updateAssignment(
        assignmentId: string,
        payload: UpdateAssignmentDTO,
        authUser: AuthUser
    ): Promise<void>;
    deleteAssignment(assignmentId: string, authUser: AuthUser): Promise<void>;
}