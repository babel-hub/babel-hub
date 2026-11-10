import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload, CreateMonitoringMessagePayload, EscalateInfraction, GetStudentInfractionsByCoursePayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionTypeHierarchy, MonitoringMessage,
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
            codeId: payload.codeId,
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
            codeId: payload.codeId,
            description: nullifyEmpty(payload.description)
        };
    }

    private validateCreate(payload: CreateInfractionPayload): void {
        if (!payload.studentId) throw new ValidationError("El ID del estudiante es obligatorio");
        if (!payload.codeId) throw new ValidationError("El tipo de infracción es obligatorio");
        if (payload.escalate && !payload.monitoringNotes?.trim()) {
            throw new ValidationError("Cuando se escala a monitoreo, las notas de seguimiento son obligatorias");
        }
    }

    private validateUpdate(payload: UpdateInfractionPayload): void {
        if (!payload.infractionId) throw new ValidationError("El ID de la infracción es obligatorio");
        if (!payload.codeId) throw new ValidationError("El tipo de infracción es obligatorio");
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

    async getStudentInfractionsByCourse(
        payload: GetStudentInfractionsByCoursePayload,
        authUser: AuthUser
    ): Promise<StudentInfraction[]> {
        const auth = requireAuth(authUser);
        if (!payload.studentId || !payload.courseId) throw new ValidationError("El ID del estudiante o del curso son invalidos");

        return this.coexistenceRepository.getStudentInfractionsByCourse(payload, auth);
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

    async getInfractionTypes(authUser: AuthUser): Promise<InfractionTypeHierarchy[]> {
        const auth = requireAuth(authUser);

        const rawRows = await this.coexistenceRepository.getInfractionTypes(auth);

        const typesMap = new Map<string, InfractionTypeHierarchy>();

        for (const row of rawRows as any[]) {
            if (!typesMap.has(row.type_id)) {
                typesMap.set(row.type_id, {
                    id: row.type_id,
                    name: row.type_name,
                    order_index: row.order_index,
                    articles: []
                });
            }
            const currentType = typesMap.get(row.type_id)!;

            if (row.article_id) {
                let currentArticle = currentType.articles.find(a => a.id === row.article_id);

                if (!currentArticle) {
                    currentArticle = {
                        id: row.article_id,
                        number: row.article_number,
                        name: row.article_name,
                        codes: []
                    };
                    currentType.articles.push(currentArticle);
                }

                if (row.code_id) {
                    if (!currentArticle.codes.some(c => c.id === row.code_id)) {
                        currentArticle.codes.push({
                            id: row.code_id,
                            number: row.code_number,
                            name: row.code_name
                        });
                    }
                }
            }
        }

        return Array.from(typesMap.values());
    }

    async getMonitoringMessages(
        monitoringId: string,
        authUser: AuthUser
    ): Promise<MonitoringMessage[]> {
        const auth = requireAuth(authUser);
        if (!monitoringId) throw new ValidationError("El ID del monitoreo es invalido");
        return this.coexistenceRepository.getMonitoringMessages(monitoringId, auth);
    }

    async createMonitoringMessage(
        monitoringId: string,
        payload: CreateMonitoringMessagePayload,
        authUser: AuthUser
    ): Promise<MonitoringMessage> {
        const auth = requireAuth(authUser);
        if (!monitoringId) throw new ValidationError("El ID del monitoreo es invalido");

        const message = nullifyEmpty(payload.message);
        if (!message) throw new ValidationError("El mensaje no puede estar vacío");
        if (message.length > 2000) throw new ValidationError("El mensaje es demasiado largo (máx 2000 caracteres)");

        return this.coexistenceRepository.createMonitoringMessage(
            monitoringId,
            { message },
            auth
        );
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