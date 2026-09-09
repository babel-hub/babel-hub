import type { IAssessmentRepository } from "../domain/IAssessmentRepository.js";
import type { Assessment } from "../domain/Assessment.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { insertValidWeight } from "../domain/Assessment.rules.js";
import {normalizeText} from "../../shared/domain/normalize.js";

export class AssessmentService {
    constructor(private readonly assessmentRepository: IAssessmentRepository) {}

    async getAssessments(userSchoolId: string): Promise<Assessment[]> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return this.assessmentRepository.getAssessments(userSchoolId);
    }

    async createAssessment(assessmentName: string, assessmentWeight: number, gradingTemplateId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!userSchoolId || !userId || !userRole) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!assessmentName || !gradingTemplateId) throw new ValidationError("Hay campos obligatorios que estan vacios");
        insertValidWeight(assessmentWeight);

        const currentTotal = await this.assessmentRepository.getTotalWeightForTemplate(gradingTemplateId);
        if (currentTotal + assessmentWeight > 100) {
            if (currentTotal === 100) throw new ValidationError("Este template ya tiene el 100% del peso asignado, no se pueden agregar más criterios");
            throw new ValidationError(`El peso total no puede superar 100%. Actualmente hay ${currentTotal}% asignado, y este criterio lo dejaria en ${assessmentWeight + currentTotal}%.`);
        }

        return this.assessmentRepository.createAssessment(normalizeText(assessmentName), assessmentWeight, gradingTemplateId, userId, userRole, userSchoolId);
    }

    async updateAssessment(assessmentId: string, assessmentName: string, assessmentWeight: number, gradingTemplateId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!userSchoolId || !userId || !userRole) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!assessmentId) throw new ValidationError("El ID del assessment no esta siendo entregado");
        if (!assessmentName || !gradingTemplateId) throw new ValidationError("Hay campos obligatorios que estan vacios");
        insertValidWeight(assessmentWeight);

        const currentTotal = await this.assessmentRepository.getTotalWeightForTemplate(gradingTemplateId, assessmentId);
        if (currentTotal + assessmentWeight > 100) {
            throw new ValidationError(`El peso total no puede superar 100%. Actualmente hay ${currentTotal}% asignado (sin contar este criterio), y este cambio lo dejaría en ${currentTotal + assessmentWeight}%.`);
        }

        return this.assessmentRepository.updateAssessment(assessmentId, assessmentName, assessmentWeight, gradingTemplateId, userId, userRole, userSchoolId);
    }

    async deleteAssessment(assessmentId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!assessmentId) throw new ValidationError("El ID del assessment no esta siendo entregado");
        if (!userSchoolId || !userId || !userRole) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return this.assessmentRepository.deleteAssessment(assessmentId, userId, userRole, userSchoolId);
    }
}