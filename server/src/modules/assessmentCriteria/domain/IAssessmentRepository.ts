import type { Assessment, BaseAssessment } from './Assessment.types.js';
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IAssessmentRepository {
    getAssessments(userSchoolId: string): Promise<Assessment[]>;
    getAssessmentByAssignment(classId: string): Promise<BaseAssessment[]>;
    getTotalWeightForTemplate(gradingTemplateId: string, excludeAssessmentId?: string): Promise<number>;
    createAssessment(assessmentName: string, assessmentWeight: number, gradingTemplateId: string, authUser: AuthUser): Promise<void>;
    updateAssessment(assessmentId: string, assessmentName: string, assessmentWeight: number, gradingTemplateId: string, authUser: AuthUser): Promise<void>;
    deleteAssessment(assessmentId: string, authUser: AuthUser): Promise<void>;
}