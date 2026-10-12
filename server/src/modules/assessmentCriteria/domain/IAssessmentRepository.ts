import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {Assessment, BaseAssessment, CreateAssessmentPayload, UpdateAssessmentPayload} from "./Assessment.types.js";

export interface IAssessmentRepository {
    getAssessments(authUser: AuthUser): Promise<Assessment[]>;
    getAssessmentByAssignment(classId: string, authUser: AuthUser): Promise<BaseAssessment[]>;
    getTotalWeightForTemplate(gradingTemplateId: string, excludeAssessmentId?: string): Promise<number>;
    createAssessment(payload: CreateAssessmentPayload, authUser: AuthUser): Promise<void>;
    updateAssessment(payload: UpdateAssessmentPayload, authUser: AuthUser): Promise<void>;
    deleteAssessment(assessmentId: string, authUser: AuthUser): Promise<void>;
}