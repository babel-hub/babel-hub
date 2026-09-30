import type {CourseBreakByDate} from "./CourseBreak.types.js";

export interface ICourseBreakRepository {
    getCourseBreaksByDate(courseId: string, date: string, schoolId: string): Promise<CourseBreakByDate[]>;
}