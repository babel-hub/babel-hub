import type { IClassScheduleRepository } from "../domain/IClassScheduleRepository.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    UpdateSchedule,
    UpsertSchedule,
    CheckOverlapPayload,
    CourseSchedule
} from "../domain/ClassSchedule.types.js";
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

    async createClassSchedule(
        classId: string,
        schedulesInput: UpsertSchedule | UpsertSchedule[],
        authUser: AuthUser
    ): Promise<void> {
        const auth = requireAuth(authUser);
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio");

        const schedules = Array.isArray(schedulesInput) ? schedulesInput : [schedulesInput];

        if (schedules.length === 0) {
            throw new ValidationError("Debes enviar al menos un horario");
        }
        if (schedules.length > 10) {
            throw new ValidationError("No puedes agregar más de 15 horarios a la vez");
        }

        const normalized: UpsertSchedule[] = schedules.map((s, i) => {
            if (s.day === undefined || !s.startTime || !s.endTime) {
                throw new ValidationError(`Faltan campos obligatorios en el horario ${i + 1}`);
            }
            validateTimeRange(s.startTime, s.endTime);
            return {
                ...s,
                room: normalizeOptionalText(s.room),
            };
        });

        for (const slot of normalized) {
            await this.assertNoOverlap(classId, slot, undefined, auth);
        }

        for (let i = 0; i < normalized.length; i++) {
            for (let j = i + 1; j < normalized.length; j++) {
                const a = normalized[i]!;
                const b = normalized[j]!;
                if (
                    a.day === b.day &&
                    a.startTime < b.endTime &&
                    b.startTime < a.endTime
                ) {
                    throw new ValidationError(
                        `Los horarios ${i + 1} y ${j + 1} se cruzan entre sí`
                    );
                }
            }
        }

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