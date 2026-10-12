import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { CreatePeriodPayload, Period, UpdatePeriodPayload } from "./Period.types.js";

export interface IPeriodsRepository {
    getPeriods(authUser: AuthUser): Promise<Period[]>;
    checkPeriodOverlap(userSchoolId: string, startDate: string, endDate: string, excludePeriodId?: string): Promise<boolean>;
    createPeriod(payload: CreatePeriodPayload, authUser: AuthUser): Promise<void>;
    updatePeriod(payload: UpdatePeriodPayload, authUser: AuthUser): Promise<void>;
    deletePeriod(periodId: string, authUser: AuthUser): Promise<void>;
}