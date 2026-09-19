import type { IClassScheduleRepository } from "../domain/IClassScheduleRepository.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { normalizeOptionalText } from "../../shared/domain/normalize.js";
import { validateTimeRange } from "../domain/ClassSchedule.rules.js";
import type { TeacherSchedule } from "../domain/ClassSchedule.types.js";

export class ClassScheduleService {
    constructor(private readonly classScheduleRepository: IClassScheduleRepository ) {}

    async createClassSchedule(classId: string, day: number, startTime: string, endTime: string, room: string, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!classId || !day || !startTime || !endTime) throw new ValidationError("Faltan campos obligatorios");
        validateTimeRange(startTime, endTime);

        const hasOverlap = await this.classScheduleRepository.checkTeacherOverlap(classId, day, startTime, endTime);
        if (hasOverlap) throw new ValidationError("El profesor ya tiene una clase asignada que cruza con este horario");
        const hasCourseOverlap = await this.classScheduleRepository.checkCourseOverlap(classId, day, startTime, endTime);
        if (hasCourseOverlap) throw new ValidationError("El curso ya tiene otra clase asignada que cruza con este horario");

        const normalize = {
            room: normalizeOptionalText(room)
        };

        return await this.classScheduleRepository.createClassSchedule(classId, day, startTime, endTime, normalize.room, authUser);
    }
}