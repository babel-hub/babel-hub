import type { IScalesRepository } from "../domain/IScalesRepository.js";
import type { Scale } from "../domain/Scales.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class ScaleService {
    constructor(private readonly scaleRepository: IScalesRepository) {}

    async getScales(authUser: AuthUser): Promise<Scale[]> {
        const auth = requireAuth(authUser);
        return this.scaleRepository.getScales(auth);
    }

    async getClassScale(classId: string, authUser: AuthUser): Promise<Scale> {
        const auth = requireAuth(authUser);
        if (!classId) throw new ValidationError("El id de la asignatura no está siendo enviado");
        return this.scaleRepository.getClassScale(classId, auth);
    }
}