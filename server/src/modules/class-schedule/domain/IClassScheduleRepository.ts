import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IClassScheduleRepository {
    createClassSchedule(classId: string, day: number, startTime: string, endTime: string, room: string | null, authUser: AuthUser): Promise<void>;
    checkTeacherOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean>;
}