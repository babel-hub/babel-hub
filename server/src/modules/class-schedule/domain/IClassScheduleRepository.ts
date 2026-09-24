import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {TeacherSchedule, UpdateSchedule, UpsertSchedule} from "./ClassSchedule.types.js";

export interface IClassScheduleRepository {
    getTeacherSchedule(teacherId: string): Promise<TeacherSchedule[]>;
    createClassSchedule(classId: string, schedule: UpsertSchedule, authUser: AuthUser): Promise<void>;
    checkTeacherOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean>;
    checkCourseOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean>;
    updateClassSchedule(scheduleId: string, schedule: UpdateSchedule, authUser: AuthUser): Promise<void>;
    deleteClassSchedule(scheduleId: string, authUser: AuthUser): Promise<void>;
}