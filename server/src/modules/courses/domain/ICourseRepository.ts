import type {
    Course,
    CourseDetails,
    Courses,
    CreateCourse,
    TeacherCourse,
    UpdateCourse
} from "./Course.types.js";

export interface ICourseRepository {
    getCourses(userSchoolId: string, isActive: boolean): Promise<Courses[] | []>;
    getCourseDetails(courseId: string, userSchoolId: string, isActive: boolean): Promise<Course | null>;
    createCourse(courseName: string, courseYear: string, courseTeacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<CreateCourse>;
    updateCourse(courseId: string, courseName: string, courseYear: string, courseTeacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<UpdateCourse>;
    deleteCourse(courseId: string, userId: string, userRole: string, userSchoolId: string): Promise<void>;
    getTeacherCourse(userId: string, userSchoolId: string): Promise<TeacherCourse>;
}