import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    CreateInfractionPayload,
    CreateMonitoringMessagePayload,
    EscalateInfraction,
    GetStudentInfractionsByCoursePayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload,
    MonitoringMessage,
    RawInfraction,
    StudentInfraction,
    StudentMonitoring,
    UpdateInfractionPayload,
} from "./Coexistence.types.js";

export interface ICoexistenceRepository {
    getStudentInfractions(payload: GetStudentInfractionsPayload, authUser: AuthUser): Promise<StudentInfraction[]>;
    getStudentInfractionsByCourse(payload: GetStudentInfractionsByCoursePayload, authUser: AuthUser): Promise<StudentInfraction[]>;
    getStudentMonitoring(payload: GetStudentMonitoringPayload, authUser: AuthUser): Promise<StudentMonitoring[]>;
    getInfractionTypes(authUser: AuthUser): Promise<RawInfraction[]>;

    createInfraction(payload: CreateInfractionPayload, authUser: AuthUser): Promise<void>;

    updateInfraction(payload: UpdateInfractionPayload, authUser: AuthUser): Promise<void>;
    deleteInfraction(infractionId: string, authUser: AuthUser): Promise<void>;
    escalateInfraction(infractionId: string, payload: EscalateInfraction, authUser: AuthUser): Promise<void>;

    getMonitoringMessages(monitoringId: string, authUser: AuthUser): Promise<MonitoringMessage[]>;
    createMonitoringMessage(monitoringId: string, payload: CreateMonitoringMessagePayload, authUser: AuthUser): Promise<MonitoringMessage>;

    publishInfraction(infractionId: string, published: boolean, authUser: AuthUser): Promise<void>;

    // Dashboard interfaces

    getDashboardStats(authUser: AuthUser): Promise<{
        unpublished_infractions: number;
        stale_monitorings: number;
    }>;
}