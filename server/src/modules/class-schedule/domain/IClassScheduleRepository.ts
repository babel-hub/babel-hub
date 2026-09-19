import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { TeacherSchedule } from "./ClassSchedule.types.js";

export interface IClassScheduleRepository {
    getTeacherSchedule(teacherId: string): Promise<TeacherSchedule[]>;
    createClassSchedule(classId: string, day: number, startTime: string, endTime: string, room: string | null, authUser: AuthUser): Promise<void>;
    checkTeacherOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean>;
    checkCourseOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean>;
}