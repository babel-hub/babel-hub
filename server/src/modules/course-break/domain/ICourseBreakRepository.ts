import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { CourseBreakByDate, GetCourseBreaksByDatePayload } from "./CourseBreak.types.js";

export interface ICourseBreakRepository {
    getCourseBreaksByDate(payload: GetCourseBreaksByDatePayload, authUser: AuthUser): Promise<CourseBreakByDate[]>;
}