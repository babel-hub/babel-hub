import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload, EscalateInfraction,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload,
    InfractionType,
    StudentInfraction,
    StudentMonitoring,
    UpdateInfractionPayload,
} from "../domain/Coexistence.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { nullifyEmpty } from "../../shared/domain/normalize.js";

export class CoexistenceService {
    constructor(
        private readonly coexistenceRepository: ICoexistenceRepository,
    ) {}

    private normalizeCreate(payload: CreateInfractionPayload): CreateInfractionPayload {
        return {
            studentId: payload.studentId,
            infractionTypeId: payload.infractionTypeId,
            description: nullifyEmpty(payload.description),
            escalate: payload.escalate,
            monitoringNotes: payload.escalate
                ? nullifyEmpty(payload.monitoringNotes)
                : null,
        };
    }

    private normalizeUpdate(payload: UpdateInfractionPayload): UpdateInfractionPayload {
        return {
            infractionId: payload.infractionId,
            infractionTypeId: payload.infractionTypeId,
            description: nullifyEmpty(payload.description)
        };
    }

    private validateCreate(payload: CreateInfractionPayload): void {
        if (!payload.studentId) throw new ValidationError("El ID del estudiante es obligatorio");
        if (!payload.infractionTypeId) throw new ValidationError("El tipo de infracción es obligatorio");
        if (payload.escalate && !payload.monitoringNotes?.trim()) {
            throw new ValidationError("Cuando se escala a monitoreo, las notas de seguimiento son obligatorias");
        }
    }

    private validateUpdate(payload: UpdateInfractionPayload): void {
        if (!payload.infractionId) throw new ValidationError("El ID de la infracción es obligatorio");
        if (!payload.infractionTypeId) throw new ValidationError("El tipo de infracción es obligatorio");
    }

    async getStudentInfractions(
        payload: GetStudentInfractionsPayload,
        authUser: AuthUser,
    ): Promise<StudentInfraction[]> {
        const auth = requireAuth(authUser);
        if (!payload.studentId || !payload.classId) {
            throw new ValidationError("El ID del estudiante y de la clase son invalidos");
        }
        return this.coexistenceRepository.getStudentInfractions(payload, auth);
    }

    async escalateInfraction(infractionId: string, payload: EscalateInfraction, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.studentId || !payload.courseId || !infractionId) {
            throw new ValidationError("El ID del estudiante, la clase y la infracción son invalidos");
        }
        const normalized = {
            ...payload,
            monitoringNotes: nullifyEmpty(payload.monitoringNotes)
        }

        return this.coexistenceRepository.escalateInfraction(infractionId, normalized, auth);
    }

    async getStudentMonitoring(
        payload: GetStudentMonitoringPayload,
        authUser: AuthUser,
    ): Promise<StudentMonitoring[]> {
        const auth = requireAuth(authUser);
        if (!payload.studentId || !payload.courseId) {
            throw new ValidationError("El ID del estudiante y del curso son invalidos");
        }
        return this.coexistenceRepository.getStudentMonitoring(payload, auth);
    }

    async getInfractionTypes(authUser: AuthUser): Promise<InfractionType[]> {
        const auth = requireAuth(authUser);
        return this.coexistenceRepository.getInfractionTypes(auth);
    }

    async createInfraction(
        classId: string,
        payload: CreateInfractionPayload,
        authUser: AuthUser,
    ): Promise<void> {
        const auth = requireAuth(authUser);
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio");

        this.validateCreate(payload);

        const normalized = this.normalizeCreate(payload);
        await this.coexistenceRepository.createInfraction(classId, normalized, auth);
    }

    async updateInfraction(
        payload: UpdateInfractionPayload,
        authUser: AuthUser,
    ): Promise<void> {
        const auth = requireAuth(authUser);
        this.validateUpdate(payload);

        const normalized = this.normalizeUpdate(payload);
        await this.coexistenceRepository.updateInfraction(normalized, auth);
    }

    async deleteInfraction(infractionId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!infractionId) throw new ValidationError("El ID de la infracción es invalida");

        await this.coexistenceRepository.deleteInfraction(infractionId, auth);
    }
}