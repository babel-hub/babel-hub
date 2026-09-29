import type { IAssessmentRepository } from "../domain/IAssessmentRepository.js";
import type { Assessment } from "../domain/Assessment.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { insertValidWeight } from "../domain/Assessment.rules.js";
import { normalizeText } from "../../shared/domain/normalize.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export class AssessmentService {
    constructor(private readonly assessmentRepository: IAssessmentRepository) {}

    async getAssessments(userSchoolId: string): Promise<Assessment[]> {
        if (!userSchoolId) throw new UnauthorizedError("Falta el ID del colegio.");

        return this.assessmentRepository.getAssessments(userSchoolId);
    }

    async createAssessment(assessmentName: string, assessmentWeight: number, gradingTemplateId: string, authUser: AuthUser): Promise<void> {
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        if (!assessmentName || !gradingTemplateId) throw new ValidationError("Hay campos obligatorios que están vacíos.");

        insertValidWeight(assessmentWeight);

        const currentTotal = await this.assessmentRepository.getTotalWeightForTemplate(gradingTemplateId);
        if (currentTotal + assessmentWeight > 100) {
            if (currentTotal === 100) {
                throw new ValidationError("Esta plantilla de calificación ya tiene el 100% del peso asignado, no se pueden agregar más criterios.");
            }
            throw new ValidationError(`El peso total no puede superar el 100%. Actualmente hay ${currentTotal}% asignado, y este criterio lo dejaría en ${assessmentWeight + currentTotal}%.`);
        }

        return this.assessmentRepository.createAssessment(normalizeText(assessmentName), assessmentWeight, gradingTemplateId, authUser);
    }

    async updateAssessment(assessmentId: string, assessmentName: string, assessmentWeight: number, gradingTemplateId: string, authUser: AuthUser): Promise<void> {
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }
        if (!assessmentId) throw new ValidationError("El ID del criterio de evaluación es obligatorio.");
        if (!assessmentName || !gradingTemplateId) {
            throw new ValidationError("Hay campos obligatorios que están vacíos.");
        }

        insertValidWeight(assessmentWeight);

        const currentTotal = await this.assessmentRepository.getTotalWeightForTemplate(gradingTemplateId, assessmentId);
        if (currentTotal + assessmentWeight > 100) {
            throw new ValidationError(`El peso total no puede superar el 100%. Actualmente hay ${currentTotal}% asignado (sin contar este criterio), y este cambio lo dejaría en ${currentTotal + assessmentWeight}%.`);
        }

        return this.assessmentRepository.updateAssessment(assessmentId, normalizeText(assessmentName), assessmentWeight, gradingTemplateId, authUser);
    }

    async deleteAssessment(assessmentId: string, authUser: AuthUser): Promise<void> {
        if (!assessmentId) throw new ValidationError("El ID del criterio de evaluación es obligatorio.");
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }

        return this.assessmentRepository.deleteAssessment(assessmentId, authUser);
    }
}