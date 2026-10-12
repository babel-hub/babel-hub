import type {AssessmentCriteria, CreateGradingTemplatePayload,
    DeleteGradingTemplatePayload, GetGradingTemplateDetailsPayload, GradingTemplate, UpdateGradingTemplatePayload} from "./GradingTemplate.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";



export interface IGradingTemplateRepository {
    getGradingTemplates(authUser: AuthUser): Promise<GradingTemplate[]>;
    getGradingTemplateDetails(payload: GetGradingTemplateDetailsPayload, authUser: AuthUser): Promise<AssessmentCriteria>;
    createGradingTemplate(payload: CreateGradingTemplatePayload, authUser: AuthUser): Promise<void>;
    updateGradingTemplate(payload: UpdateGradingTemplatePayload, authUser: AuthUser): Promise<void>;
    deleteGradingTemplate(payload: DeleteGradingTemplatePayload, authUser: AuthUser): Promise<void>;
}