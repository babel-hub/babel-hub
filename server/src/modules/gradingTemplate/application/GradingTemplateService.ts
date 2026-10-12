import type { IGradingTemplateRepository } from "../domain/IGradingTemplateRepository.js";
import type {
    AssessmentCriteria,
    GradingTemplate,
    CreateGradingTemplatePayload,
    UpdateGradingTemplatePayload,
    GetGradingTemplateDetailsPayload
} from "../domain/GradingTemplate.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class GradingTemplateService {
    constructor(private readonly gradingRepository: IGradingTemplateRepository) {}

    private validate(payload: CreateGradingTemplatePayload): void {
        if (!payload.gradingName?.trim() || !payload.gradingScaleId?.trim()) {
            throw new ValidationError("Hay campos obligatorios vacíos");
        }
    }

    async getGradingTemplates(authUser: AuthUser): Promise<GradingTemplate[]> {
        const auth = requireAuth(authUser);
        return this.gradingRepository.getGradingTemplates(auth);
    }

    async getGradingTemplateDetails(gradingId: string, authUser: AuthUser): Promise<AssessmentCriteria> {
        const auth = requireAuth(authUser);
        if (!gradingId) throw new ValidationError("El id del criterio de nota no fue entregado");

        const payload: GetGradingTemplateDetailsPayload = { gradingId };
        return this.gradingRepository.getGradingTemplateDetails(payload, auth);
    }

    async createGradingTemplate(payload: CreateGradingTemplatePayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        this.validate(payload);
        await this.gradingRepository.createGradingTemplate(payload, auth);
    }

    async updateGradingTemplate(payload: UpdateGradingTemplatePayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.gradingId) throw new ValidationError("El id del criterio de nota no fue entregado");
        this.validate(payload);
        await this.gradingRepository.updateGradingTemplate(payload, auth);
    }

    async deleteGradingTemplate(gradingId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!gradingId) throw new ValidationError("El id del criterio de nota no fue entregado");
        await this.gradingRepository.deleteGradingTemplate({ gradingId }, auth);
    }
}