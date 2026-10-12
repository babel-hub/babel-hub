import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    ClassInfo,
    ClassRow,
    CourseClass,
    CreateClass, CreateClassPayload,
    StudentClassRow,
    TeacherClassDetails,
    TeacherClasses
} from "./Classes.types.js";

export interface IClassRepository {
    getClassDetails(classId: string, isActive: boolean, authUser: AuthUser): Promise<ClassInfo | null>;
    getTeacherClassesProfile(teacherId: string, authUser: AuthUser): Promise<ClassRow[]>;
    getStudentProfileClasses(courseId: string, authUser: AuthUser): Promise<StudentClassRow[]>;
    getCourseClasses(courseId: string, isActive: boolean, authUser: AuthUser): Promise<CourseClass[]>;
    createClass(payload: CreateClassPayload, authUser: AuthUser): Promise<void>;
    updateClass(classId: string, teacherId: string, authUser: AuthUser): Promise<void>;
    deleteClass(classId: string, authUser: AuthUser): Promise<void>;
    getTeacherClasses(teacherId: string, isActive: boolean, authUser: AuthUser): Promise<TeacherClasses[]>;
    getTeacherClassDetails(classId: string, teacherId: string, authUser: AuthUser): Promise<TeacherClassDetails | null>;
}