import type { AuthUser, ParentCredentials } from "../../shared/domain/Shared.types.js";
import type {Parent, ParentStudent, RelationTypes, StudentParentRow} from "./Parent.types.js";

export interface IParentRepository {
    getParents(userSchoolId: string): Promise<Parent[]>;
    getParentStudents(authUser: AuthUser): Promise<ParentStudent[]>;
    getParentByStudentId(studentId: string): Promise<StudentParentRow[]>;
    createParent(parentCredentials: ParentCredentials, authUser: AuthUser): Promise<void>;
    linkedParentToStudent(parentId: string, studentId: string, type: RelationTypes, authUser: AuthUser): Promise<void>;

    deleteParent(parentId: string, authUser: AuthUser): Promise<void>;
}