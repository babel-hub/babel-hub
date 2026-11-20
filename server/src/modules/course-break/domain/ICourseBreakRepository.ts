import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    CourseBreak,
    CourseBreakByDate,
    CreateBreakGroupPayload,
    GetCourseBreaksByDatePayload,
    UpdateBreakGroupPayload
} from "./CourseBreak.types.js";

export interface ICourseBreakRepository {
    getCourseBreaksByDate(payload: GetCourseBreaksByDatePayload, authUser: AuthUser): Promise<CourseBreakByDate[]>;
    getCourseBreaks(courseId: string, authUser: AuthUser): Promise<CourseBreak[]>;
    createBreaks(courseId: string, payload: CreateBreakGroupPayload, authUser: AuthUser): Promise<void>;
    replaceBreakGroup(courseId: string, payload: UpdateBreakGroupPayload, authUser: AuthUser): Promise<void>;
    deleteBreaks(courseId: string, ids: string[], authUser: AuthUser): Promise<void>;
}