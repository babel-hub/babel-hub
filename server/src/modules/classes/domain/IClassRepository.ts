import type {ClassDetails, CreateClass, StudentClassRow, TeacherClassDetails, TeacherClasses} from "./Classes.types.js";

export interface IClassRepository {
    getClassDetails(classId: string, schoolId: string, isActive: boolean): Promise<ClassDetails | null>;
    getStudentProfileClasses(courseId: string): Promise<StudentClassRow[]>;
    createClass(courseId: string, subjectId: string, teacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<CreateClass>;
    updateClass(classId: string, teacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<void>;
    deleteClass(classId: string, userId: string, userRole: string, userSchoolId: string): Promise<void>;
    getTeacherClasses(teacherId: string, teacherSchoolId: string, isActive: boolean): Promise<TeacherClasses[]>;
    getTeacherClassDetails(classId: string, teacherId: string, teacherSchoolId: string): Promise<TeacherClassDetails | null>;
}