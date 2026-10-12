import type {
    IAreaRepository
} from "../domain/IAreaRepository.js";
import type { Area, AreaDetails, UpdateAreaPayload, CreateAreaPayload } from "../domain/Areas.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { normalizeText } from "../../shared/domain/normalize.js";
import type { ISubjectsRepository } from "../../subjects/domain/ISubjectsRepository.js";

export class AreaService {
    constructor(
        private readonly areasRepository: IAreaRepository,
        private readonly subjectRepository: ISubjectsRepository,
    ) {}

    async getAreas(authUser: AuthUser): Promise<Area[]> {
        const auth = requireAuth(authUser);
        return this.areasRepository.getAreas(auth);
    }

    async getAreaDetails(id: string, authUser: AuthUser): Promise<AreaDetails> {
        const auth = requireAuth(authUser);
        if (!id) throw new ValidationError("El ID del área es obligatorio.");

        const area = await this.areasRepository.getAreaDetails(id, auth);
        if (!area) throw new NotFoundError("No se encontró el área solicitada.");
        const subjects = await this.subjectRepository.getSubjectsByArea({ subjectAreaId: id }, auth);
        return { area, subjects };
    }

    async createArea(payload: CreateAreaPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        const normalized: CreateAreaPayload = { name: normalizeText(payload.name) };
        if (!normalized.name) throw new ValidationError("El nombre del área es obligatorio");

        return this.areasRepository.insertArea(normalized, auth);
    }

    async updateArea(payload: UpdateAreaPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.areaId) throw new ValidationError("El ID del área es obligatorio");

        const normalized: UpdateAreaPayload = {
            areaId: payload.areaId,
            name: normalizeText(payload.name)
        };
        if (!normalized.name) throw new ValidationError("El nombre del área es obligatorio");

        return this.areasRepository.updateArea(normalized, auth);
    }

    async deleteArea(id: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!id) throw new ValidationError("El ID del área es obligatorio.");
        await this.areasRepository.deleteArea(id, auth);
    }
}