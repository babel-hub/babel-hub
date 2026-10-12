import type { AuthUser, TeacherCreateCredentials, TeacherUpdateCredentials } from "../../shared/domain/Shared.types.js";
import type {CreateTeacher, TeacherDetails, TeacherRow, Teachers} from "./Teacher.types.js";

export interface GetTeachersPayload {
    available: string | undefined;
    includeTeacherId: string | undefined;
    isActive: boolean;
}

export interface ITeacherRepository {
    getTeachers(payload: GetTeachersPayload, authUser: AuthUser): Promise<Teachers[]>;
    getTeacherDetails(teacherId: string, authUser: AuthUser): Promise<TeacherRow | null>;
    createTeacher(teacherCredentials: TeacherCreateCredentials, authUser: AuthUser): Promise<CreateTeacher>;
    updateTeacher(teacherCredentials: TeacherUpdateCredentials, authUser: AuthUser): Promise<void>;
    deleteTeacher(teacherId: string, authUser: AuthUser): Promise<void>;
}