import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    CreateInfractionPayload, EscalateInfraction,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionType,
    StudentInfraction, StudentMonitoring, UpdateInfractionPayload
} from "./Coexistence.types.js";

export interface ICoexistenceRepository {
    getStudentInfractions(payload: GetStudentInfractionsPayload, authUser: AuthUser): Promise<StudentInfraction[]>;
    getStudentMonitoring(payload: GetStudentMonitoringPayload, authUser: AuthUser): Promise<StudentMonitoring[]>;
    getInfractionTypes(authUser: AuthUser): Promise<InfractionType[]>;
    createInfraction(classId: string, payload: CreateInfractionPayload, authUser: AuthUser): Promise<void>;
    updateInfraction(payload: UpdateInfractionPayload, authUser: AuthUser): Promise<void>;
    deleteInfraction(infractionId: string, authUser: AuthUser): Promise<void>;
    escalateInfraction(infractionId: string, payload: EscalateInfraction, authUser: AuthUser): Promise<void>;
}