import type { IClassScheduleRepository } from "../domain/IClassScheduleRepository.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { UpdateSchedule, UpsertSchedule, CheckOverlapPayload } from "../domain/ClassSchedule.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { normalizeOptionalText } from "../../shared/domain/normalize.js";
import { validateTimeRange } from "../domain/ClassSchedule.rules.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class ClassScheduleService {
    constructor(private readonly classScheduleRepository: IClassScheduleRepository) {}

    private async assertNoOverlap(
        classId: string,
        schedule: Pick<UpsertSchedule, "day" | "startTime" | "endTime">,
        excludeScheduleId: string | undefined,
        authUser: AuthUser
    ): Promise<void> {
        const payload: CheckOverlapPayload = {
            classId,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            excludeScheduleId
        };

        const teacherOverlap = await this.classScheduleRepository.checkTeacherOverlap(payload, authUser);
        if (teacherOverlap) {
            throw new ValidationError("El profesor ya tiene una clase asignada que cruza con este horario");
        }

        const courseOverlap = await this.classScheduleRepository.checkCourseOverlap(payload, authUser);
        if (courseOverlap) {
            throw new ValidationError("El curso ya tiene otra clase asignada que cruza con este horario");
        }
    }

    async createClassSchedule(classId: string, schedule: UpsertSchedule, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        if (!classId || schedule.day === undefined || !schedule.startTime || !schedule.endTime) throw new ValidationError("Faltan campos obligatorios");
        validateTimeRange(schedule.startTime, schedule.endTime);

        await this.assertNoOverlap(classId, schedule, undefined, auth);

        const normalized: UpsertSchedule = {
            ...schedule,
            room: normalizeOptionalText(schedule.room)
        };

        await this.classScheduleRepository.createClassSchedule(classId, normalized, auth);
    }

    async updateClassSchedule(scheduleId: string, schedule: UpdateSchedule, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        if (!scheduleId || schedule.day === undefined || !schedule.startTime || !schedule.endTime) {
            throw new ValidationError("Faltan campos obligatorios");
        }
        validateTimeRange(schedule.startTime, schedule.endTime);

        await this.assertNoOverlap(schedule.class_id, schedule, scheduleId, auth);

        const normalized: UpdateSchedule = {
            ...schedule,
            room: normalizeOptionalText(schedule.room)
        };

        await this.classScheduleRepository.updateClassSchedule(scheduleId, normalized, auth);
    }

    async deleteClassSchedule(scheduleId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!scheduleId) throw new ValidationError("El ID del horario es obligatorio");
        await this.classScheduleRepository.deleteClassSchedule(scheduleId, auth);
    }
}