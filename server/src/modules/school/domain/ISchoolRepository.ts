import type { CreateSchoolPayload } from "./School.types.js";
import type { MasterAuth } from "../../shared/auth/requireMaster.js";

export interface ISchoolRepository {
    createSchool(payload: CreateSchoolPayload, authUser: MasterAuth): Promise<void>;
}