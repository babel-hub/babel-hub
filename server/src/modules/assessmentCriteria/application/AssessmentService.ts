import type {
    IAssessmentRepository
} from "../domain/IAssessmentRepository.js";
import type { Assessment, CreateAssessmentPayload, UpdateAssessmentPayload } from "../domain/Assessment.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { normalizeText } from "../../shared/domain/normalize.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { validateWeight } from "../domain/Assessment.rules.js";

export class AssessmentService {
    constructor(private readonly assessmentRepository: IAssessmentRepository) {}

    private validateName(name: string): string {
        const normalized = normalizeText(name);
        if (!normalized) throw new ValidationError("El nombre del criterio es obligatorio.");
        return normalized;
    }

    private async assertWeightFits(
        gradingTemplateId: string,
        assessmentWeight: number,
        excludeAssessmentId?: string
    ): Promise<void> {
        validateWeight(assessmentWeight);

        const currentTotal = await this.assessmentRepository.getTotalWeightForTemplate(
            gradingTemplateId,
            excludeAssessmentId
        );

        if (currentTotal + assessmentWeight > 100) {
            if (currentTotal === 100 && !excludeAssessmentId) {
                throw new ValidationError("Esta plantilla de calificación ya tiene el 100% del peso asignado, no se pueden agregar más criterios.");
            }
            const context = excludeAssessmentId
                ? `Actualmente hay ${currentTotal}% asignado (sin contar este criterio)`
                : `Actualmente hay ${currentTotal}% asignado`;
            throw new ValidationError(
                `El peso total no puede superar el 100%. ${context}, y este cambio lo dejaría en ${currentTotal + assessmentWeight}%.`
            );
        }
    }

    async getAssessments(authUser: AuthUser): Promise<Assessment[]> {
        const auth = requireAuth(authUser);
        return this.assessmentRepository.getAssessments(auth);
    }

    async createAssessment(payload: CreateAssessmentPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        const name = this.validateName(payload.assessmentName);
        if (!payload.gradingTemplateId) {
            throw new ValidationError("La plantilla de calificación es obligatoria.");
        }

        await this.assertWeightFits(payload.gradingTemplateId, payload.assessmentWeight);

        await this.assessmentRepository.createAssessment({
            assessmentName: name,
            assessmentWeight: payload.assessmentWeight,
            gradingTemplateId: payload.gradingTemplateId
        }, auth);
    }

    async updateAssessment(payload: UpdateAssessmentPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.assessmentId) throw new ValidationError("El ID del criterio de evaluación es obligatorio.");

        const name = this.validateName(payload.assessmentName);
        if (!payload.gradingTemplateId) {
            throw new ValidationError("La plantilla de calificación es obligatoria.");
        }

        await this.assertWeightFits(
            payload.gradingTemplateId,
            payload.assessmentWeight,
            payload.assessmentId
        );

        await this.assessmentRepository.updateAssessment({
            assessmentId: payload.assessmentId,
            assessmentName: name,
            assessmentWeight: payload.assessmentWeight,
            gradingTemplateId: payload.gradingTemplateId
        }, auth);
    }

    async deleteAssessment(assessmentId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!assessmentId) throw new ValidationError("El ID del criterio de evaluación es obligatorio.");
        await this.assessmentRepository.deleteAssessment(assessmentId, auth);
    }
}