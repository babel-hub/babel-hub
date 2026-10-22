import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    AvailableSubjects,
    CreateSubject, CreateSubjectPayload,
    GetAvailableSubjectsPayload,
    GetSubjectsByAreaPayload, SubjectById,
    SubjectDetails, UpdateSubjectPayload
} from "./Subjects.types.js";

export interface ISubjectsRepository {
    getSubjectsByArea(payload: GetSubjectsByAreaPayload, authUser: AuthUser): Promise<SubjectDetails[]>;
    getSubjectById(subjectId: string, authUser: AuthUser): Promise<SubjectById | null>;
    getAvailableSubjects(payload: GetAvailableSubjectsPayload, authUser: AuthUser): Promise<AvailableSubjects[]>;
    createSubject(payload: CreateSubjectPayload, authUser: AuthUser): Promise<CreateSubject>;
    updateSubject(payload: UpdateSubjectPayload, authUser: AuthUser): Promise<void>;
    deleteSubject(subjectId: string, authUser: AuthUser): Promise<void>;
}