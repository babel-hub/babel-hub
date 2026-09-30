import type { CreatePeriod, Period, UpdatePeriod } from "./Period.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IPeriodsRepository {
    getPeriods(userSchoolId: string): Promise<Period[]>;
    checkPeriodOverlap(schoolId: string, startDate: string, endDate: string, excludePeriodId?: string): Promise<boolean>;
    createPeriod(periodName: string, startDate: string, endDate: string, authUser: AuthUser): Promise<void>;
    updatePeriod(periodId: string, periodName: string, startDate: string, endDate: string, authUser: AuthUser): Promise<void>;
    deletePeriod(periodId: string, authUser: AuthUser): Promise<void>;
}