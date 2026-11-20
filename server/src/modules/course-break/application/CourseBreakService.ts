import type { ICourseBreakRepository } from "../domain/ICourseBreakRepository.js";
import type {
    CourseBreak, CreateBreakGroupPayload, UpdateBreakGroupPayload
} from "../domain/CourseBreak.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import {normalizeText, nullifyEmpty} from "../../shared/domain/normalize.js";

export class CourseBreakService {
    constructor(
        private readonly repo: ICourseBreakRepository
    ) {}

    private validateTimes(start: string, end: string): void {
        if (!start || !end) throw new ValidationError("Las horas son obligatorias");
        if (end <= start) throw new ValidationError("La hora de fin debe ser mayor a la de inicio");
    }

    private validateDays(days: number[]): void {
        if (!days || days.length === 0) throw new ValidationError("Selecciona al menos un día");
        if (days.length > 6) throw new ValidationError("Demasiados días");
        for (const d of days) {
            if (d < 1 || d > 6) throw new ValidationError(`Día inválido: ${d}`);
        }
    }

    async getCourseBreaks(courseId: string, authUser: AuthUser): Promise<CourseBreak[]> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");
        return this.repo.getCourseBreaks(courseId, auth);
    }

    async createBreaks(courseId: string, payload: CreateBreakGroupPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");
        if (!payload.name?.trim()) throw new ValidationError("El nombre es obligatorio");

        this.validateTimes(payload.start_time, payload.end_time);
        this.validateDays(payload.days);

        const normalized = {
            ...payload,
            name: normalizeText(payload.name),
            days: Array.from(new Set(payload.days)).sort((a, b) => a - b)
        }

        await this.repo.createBreaks(courseId, normalized, auth);
    }

    async updateBreakGroup(courseId: string, payload: UpdateBreakGroupPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");
        if (!payload.ids || payload.ids.length === 0) throw new ValidationError("Faltan los IDs del grupo");
        if (!payload.name?.trim()) throw new ValidationError("El nombre es obligatorio.");

        this.validateTimes(payload.start_time, payload.end_time);
        this.validateDays(payload.days);

        const normalized = {
            ...payload,
            name: normalizeText(payload.name),
            days: Array.from(new Set(payload.days)).sort((a, b) => a - b)
        }

        await this.repo.replaceBreakGroup(courseId, normalized, auth);
    }

    async deleteBreaks(courseId: string, ids: string[], authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");
        if (!ids || ids.length === 0) throw new ValidationError("Faltan los IDs a eliminar");
        await this.repo.deleteBreaks(courseId, ids, auth);
    }
}