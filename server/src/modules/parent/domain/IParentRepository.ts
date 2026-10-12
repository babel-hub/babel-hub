import type { AuthUser, ParentCredentials } from "../../shared/domain/Shared.types.js";
import type {
    LinkParentToStudentPayload,
    Parent,
    ParentStudent,
    RelationTypes,
    StudentParentRow
} from "./Parent.types.js";

export interface IParentRepository {
    getParents(authUser: AuthUser): Promise<Parent[]>;
    getParentStudents(authUser: AuthUser): Promise<ParentStudent[]>;
    getParentByStudentId(studentId: string, authUser: AuthUser): Promise<StudentParentRow[]>;
    createParent(parentCredentials: ParentCredentials, authUser: AuthUser): Promise<void>;
    linkParentToStudent(payload: LinkParentToStudentPayload, authUser: AuthUser): Promise<void>;
    deleteParent(parentId: string, authUser: AuthUser): Promise<void>;
    deleteParentStudent(id: string, authUser: AuthUser): Promise<void>;
}