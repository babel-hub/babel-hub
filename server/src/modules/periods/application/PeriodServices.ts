import type {
    IPeriodsRepository
} from "../domain/IPeriodRepository.js";
import type { CreatePeriodPayload, Period, UpdatePeriodPayload } from "../domain/Period.types.js";
import { ValidationError, ConflictError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class PeriodService {
    constructor(private readonly periodsRepository: IPeriodsRepository) {}
    private static readonly ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

    private validate(payload: CreatePeriodPayload): void {
        if (!payload.periodName?.trim() || !payload.startDate?.trim() || !payload.endDate?.trim()) {
            throw new ValidationError("Todos los campos son obligatorios.");
        }
        if (!PeriodService.ISO_DATE.test(payload.startDate) || !PeriodService.ISO_DATE.test(payload.endDate)) {
            throw new ValidationError("Las fechas deben estar en formato YYYY-MM-DD.");
        }
        if (payload.endDate <= payload.startDate) {
            throw new ValidationError("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }
    }

    async getPeriods(authUser: AuthUser): Promise<Period[]> {
        const auth = requireAuth(authUser);
        return this.periodsRepository.getPeriods(auth);
    }

    async createPeriod(payload: CreatePeriodPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        this.validate(payload);

        const hasOverlap = await this.periodsRepository.checkPeriodOverlap(
            auth.userSchoolId,
            payload.startDate,
            payload.endDate
        );
        if (hasOverlap) {
            throw new ConflictError("Las fechas elegidas se cruzan con un periodo académico ya existente.");
        }

        await this.periodsRepository.createPeriod(payload, auth);
    }

    async updatePeriod(payload: UpdatePeriodPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.periodId) throw new ValidationError("El ID del periodo es obligatorio.");
        this.validate(payload);

        const hasOverlap = await this.periodsRepository.checkPeriodOverlap(
            auth.userSchoolId,
            payload.startDate,
            payload.endDate,
            payload.periodId
        );
        if (hasOverlap) {
            throw new ConflictError("Las nuevas fechas se cruzan con otro periodo académico existente.");
        }

        await this.periodsRepository.updatePeriod(payload, auth);
    }

    async deletePeriod(periodId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!periodId) throw new ValidationError("El ID del periodo es obligatorio.");
        await this.periodsRepository.deletePeriod(periodId, auth);
    }
}