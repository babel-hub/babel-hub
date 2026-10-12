import type {
    ClassStudents, GetClassStudentsPayload, GetStudentsByNamePayload, GetStudentsPayload,
    StudentBaseRow,
    StudentByName,
    Students
} from "./Student.types.js";
import type {
    AuthUser,
    StudentCreateCredentials,
    StudentUpdateCredentials
} from "../../shared/domain/Shared.types.js";

export interface IStudentRepository {
    getStudents(payload: GetStudentsPayload, authUser: AuthUser): Promise<Students[]>;
    getClassStudents(payload: GetClassStudentsPayload, authUser: AuthUser): Promise<ClassStudents[]>;
    getStudentProfile(studentId: string, authUser: AuthUser): Promise<StudentBaseRow | null>;
    getStudentsByName(payload: GetStudentsByNamePayload, authUser: AuthUser): Promise<StudentByName[]>;
    createStudent(studentCredentials: StudentCreateCredentials, authUser: AuthUser): Promise<void>;
    updateStudent(studentCredentials: StudentUpdateCredentials, authUser: AuthUser): Promise<void>;
    deleteStudent(studentId: string, authUser: AuthUser): Promise<void>;
}