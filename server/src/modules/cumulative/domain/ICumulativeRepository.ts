import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { CumulativeAttendance, CumulativeGrades, CumulativeSummary, GetCumulativeRecordPayload } from "./Cumulative.types.js";


export interface ICumulativeRepository {
    getCumulativeGrades(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeGrades[]>;
    getCumulativeAttendance(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeAttendance[]>;
    getCumulativeSummary(payload: GetCumulativeRecordPayload, authUser: AuthUser): Promise<CumulativeSummary[]>;
}