import type {
    Course,
    Courses, CreateCoursePayload, DeleteCoursePayload, GetCourseDetailsPayload, GetCoursesPayload,
    TeacherCourse, UpdateCoursePayload
} from "./Course.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface ICourseRepository {
    getCourses(payload: GetCoursesPayload, authUser: AuthUser): Promise<Courses[] | []>;
    getCourseDetails(payload: GetCourseDetailsPayload, authUser: AuthUser): Promise<Course | null>;
    createCourse(payload: CreateCoursePayload, authUser: AuthUser): Promise<void>;
    updateCourse(payload: UpdateCoursePayload, authUser: AuthUser): Promise<void>;
    deleteCourse(payload: DeleteCoursePayload, authUser: AuthUser): Promise<void>;
    getTeacherCourse(authUser: AuthUser): Promise<TeacherCourse>;
}