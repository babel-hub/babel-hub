import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    CreateInfractionPayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionType,
    StudentInfraction, StudentMonitoring
} from "./Coexistence.types.js";

export interface ICoexistenceRepository {
    getStudentInfractions(payload: GetStudentInfractionsPayload, authUser: AuthUser): Promise<StudentInfraction[]>;
    getStudentMonitoring(payload: GetStudentMonitoringPayload, authUser: AuthUser): Promise<StudentMonitoring[]>;
    getInfractionTypes(authUser: AuthUser): Promise<InfractionType[]>;
    createInfraction(classId: string, payload: CreateInfractionPayload, authUser: AuthUser): Promise<void>;
}