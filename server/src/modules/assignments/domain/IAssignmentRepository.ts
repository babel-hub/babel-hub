import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    Assignments,
    AssignmentsByTeacherAndDate, GetAssignmentsOverviewPayload, CreateAssignmentPayload,
    UpdateAssignmentDTO
} from "./Assignment.types.js";

export interface IAssignmentRepository {
    getAssignmentsOverview(payload: GetAssignmentsOverviewPayload, authUser: AuthUser): Promise<Assignments[]>;
    getAssignmentsByTeacherAndDate(teacherProfileId: string, startDate: string, endDate: string, authUser: AuthUser): Promise<AssignmentsByTeacherAndDate[]>;
    getAssignmentOwner(assignmentId: string, authUser: AuthUser): Promise<string | null>;
    createAssignment(payload: CreateAssignmentPayload, authUser: AuthUser): Promise<void>;
    updateAssignment(assignmentId: string, payload: UpdateAssignmentDTO, authUser: AuthUser): Promise<void>;
    deleteAssignment(assignmentId: string, authUser: AuthUser): Promise<void>;
}