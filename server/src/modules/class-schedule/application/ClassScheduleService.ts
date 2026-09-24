import type { IClassScheduleRepository } from "../domain/IClassScheduleRepository.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { normalizeOptionalText } from "../../shared/domain/normalize.js";
import { validateTimeRange } from "../domain/ClassSchedule.rules.js";
import type {UpdateSchedule, UpsertSchedule} from "../domain/ClassSchedule.types.js";

export class ClassScheduleService {
    constructor(private readonly classScheduleRepository: IClassScheduleRepository ) {}

    async createClassSchedule(classId: string, schedule: UpsertSchedule, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!classId || !schedule.day || !schedule.startTime || !schedule.endTime) throw new ValidationError("Faltan campos obligatorios");
        validateTimeRange(schedule.startTime, schedule.endTime);

        const hasOverlap = await this.classScheduleRepository.checkTeacherOverlap(classId, schedule.day, schedule.startTime, schedule.endTime);
        if (hasOverlap) throw new ValidationError("El profesor ya tiene una clase asignada que cruza con este horario");
        const hasCourseOverlap = await this.classScheduleRepository.checkCourseOverlap(classId, schedule.day, schedule.startTime, schedule.endTime);
        if (hasCourseOverlap) throw new ValidationError("El curso ya tiene otra clase asignada que cruza con este horario");

        const normalize = {
            room: normalizeOptionalText(schedule.room)
        };

        return await this.classScheduleRepository.createClassSchedule(classId, { ...schedule, room: normalize.room }, authUser);
    }

    async updateClassSchedule(scheduleId: string, schedule: UpdateSchedule, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");

        /*
        * This line will be available later, when the principal role get his access to the schedule
        * if (authUser.userRole !== 'principal') throw new ForbiddenError("No tienes permisos para hacer esta accion")
        * */

        if (!scheduleId || !schedule.day || !schedule.startTime || !schedule.endTime) throw new ValidationError("Faltan campos obligatorios");
        validateTimeRange(schedule.startTime, schedule.endTime);

        const hasOverlap = await this.classScheduleRepository.checkTeacherOverlap(schedule.class_id, schedule.day, schedule.startTime, schedule.endTime, scheduleId);
        if (hasOverlap) throw new ValidationError("El profesor ya tiene una clase asignada que cruza con este horario");
        const hasCourseOverlap = await this.classScheduleRepository.checkCourseOverlap(schedule.class_id, schedule.day, schedule.startTime, schedule.endTime, scheduleId);
        if (hasCourseOverlap) throw new ValidationError("El curso ya tiene otra clase asignada que cruza con este horario");

        const normalize = {
            room: normalizeOptionalText(schedule.room)
        };

        return await this.classScheduleRepository.updateClassSchedule(scheduleId, { ...schedule, room: normalize.room }, authUser);
    }

    async deleteClassSchedule(scheduleId: string, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");

        /*
        * This line will be available later, when the principal role get his access to the schedule
        * if (authUser.userRole !== 'principal') throw new ForbiddenError("No tienes permisos para hacer esta accion")
        * */

        if (!scheduleId) throw new ValidationError("El ID de el horario no se mandaron");
        return await this.classScheduleRepository.deleteClassSchedule(scheduleId, authUser);
    }
}