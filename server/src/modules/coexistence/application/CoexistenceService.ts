import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionType,
    StudentInfraction, StudentMonitoring
} from "../domain/Coexistence.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";

export class CoexistenceService {
    constructor(
        private readonly coexistenceRepository: ICoexistenceRepository,
    ) {}

    async getStudentInfractions(payload: GetStudentInfractionsPayload, authUser: AuthUser): Promise<StudentInfraction[]> {
        const auth = requireAuth(authUser);
        if (!payload.studentId || !payload.classId) throw new ValidationError("El ID del estudiante o la clase son invalidos");

        return this.coexistenceRepository.getStudentInfractions(payload, auth)
    }

    async getStudentMonitoring(payload: GetStudentMonitoringPayload, authUser: AuthUser): Promise<StudentMonitoring[]> {
        const auth = requireAuth(authUser);
        if (!payload.studentId || !payload.courseId) throw new ValidationError("El ID del estudiante o el curso son invalidos");

        return this.coexistenceRepository.getStudentMonitoring(payload, auth)
    }

    async getInfractionTypes(authUser: AuthUser): Promise<InfractionType[]> {
        const auth = requireAuth(authUser);
        return this.coexistenceRepository.getInfractionTypes(auth);
    }

    async createInfraction(
        classId: string,
        payload: CreateInfractionPayload,
        authUser: AuthUser
    ): Promise<void> {
        const auth = requireAuth(authUser);

        if (!classId) throw new ValidationError("El ID de la clase es obligatorio");
        if (!payload.studentId) throw new ValidationError("El ID del estudiante es obligatorio");
        if (!payload.infractionTypeId) throw new ValidationError("El tipo de infracción es obligatorio");
        if (payload.escalate && !payload.monitoringNotes?.trim()) {
            throw new ValidationError("Cuando se escala a monitoreo, las notas son obligatorias");
        }

        return this.coexistenceRepository.createInfraction(classId, payload, auth);
    }
}