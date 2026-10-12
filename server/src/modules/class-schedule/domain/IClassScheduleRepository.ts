import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {CheckOverlapPayload, TeacherSchedule, UpdateSchedule, UpsertSchedule} from "./ClassSchedule.types.js";

export interface IClassScheduleRepository {
    getTeacherSchedule(teacherProfileId: string, authUser: AuthUser): Promise<TeacherSchedule[]>;
    createClassSchedule(classId: string, schedule: UpsertSchedule, authUser: AuthUser): Promise<void>;
    checkTeacherOverlap(payload: CheckOverlapPayload, authUser: AuthUser): Promise<boolean>;
    checkCourseOverlap(payload: CheckOverlapPayload, authUser: AuthUser): Promise<boolean>;
    updateClassSchedule(scheduleId: string, schedule: UpdateSchedule, authUser: AuthUser): Promise<void>;
    deleteClassSchedule(scheduleId: string, authUser: AuthUser): Promise<void>;
}