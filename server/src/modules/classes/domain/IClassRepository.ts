import type {
    ClassInfo, CourseClass,
    CreateClass,
    StudentClassRow,
    TeacherClassDetails,
    TeacherClasses
} from "./Classes.types.js";
import type {AuthUser} from "../../shared/domain/Shared.types.js";

export interface IClassRepository {
    getClassDetails(classId: string, schoolId: string, isActive: boolean): Promise<ClassInfo | null>;
    getStudentProfileClasses(courseId: string): Promise<StudentClassRow[]>;
    getCourseClasses(courseId: string, isActive: boolean): Promise<CourseClass[]>;
    createClass(courseId: string, subjectId: string, teacherId: string, authUser: AuthUser): Promise<CreateClass>;
    updateClass(classId: string, teacherId: string, authUser: AuthUser): Promise<void>;
    deleteClass(classId: string, authUser: AuthUser): Promise<void>;
    getTeacherClasses(teacherId: string, teacherSchoolId: string, isActive: boolean): Promise<TeacherClasses[]>;
    getTeacherClassDetails(classId: string, teacherId: string, teacherSchoolId: string): Promise<TeacherClassDetails | null>;
}