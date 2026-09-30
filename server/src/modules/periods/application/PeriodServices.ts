import type { IPeriodsRepository } from "../domain/IPeriodRepository.js";
import type { CreatePeriod, Period, UpdatePeriod } from "../domain/Period.types.js";
import { UnauthorizedError, ValidationError, ConflictError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export class PeriodService {
    constructor(private periodsRepository: IPeriodsRepository) {}

    async getPeriods(userSchoolId: string): Promise<Period[]> {
        if (!userSchoolId) throw new UnauthorizedError("Falta el ID del colegio.");

        return await this.periodsRepository.getPeriods(userSchoolId);
    }

    async createPeriod(periodName: string, startDate: string, endDate: string, authUser: AuthUser): Promise<void> {
        if (!periodName || !startDate || !endDate) throw new ValidationError("Todos los campos son obligatorios.");
        if (endDate <= startDate) {
            throw new ValidationError("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }
        const hasOverlap = await this.periodsRepository.checkPeriodOverlap(authUser.userSchoolId, startDate, endDate);
        if (hasOverlap) {
            throw new ConflictError("Las fechas elegidas se cruzan con un periodo académico ya existente.");
        }

        return await this.periodsRepository.createPeriod(periodName, startDate, endDate, authUser);
    }

    async updatePeriod(periodId: string, periodName: string, startDate: string, endDate: string, authUser: AuthUser): Promise<void> {
        if (!periodId) throw new ValidationError("El ID del periodo es obligatorio.");
        if (!periodName || !startDate || !endDate) throw new ValidationError("Todos los campos son obligatorios.");
        if (endDate <= startDate) throw new ValidationError("La fecha de finalización debe ser posterior a la fecha de inicio.");
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }

        const hasOverlap = await this.periodsRepository.checkPeriodOverlap(authUser.userSchoolId, startDate, endDate, periodId);
        if (hasOverlap) {
            throw new ConflictError("Las nuevas fechas se cruzan con otro periodo académico existente.");
        }

        return await this.periodsRepository.updatePeriod(periodId, periodName, startDate, endDate, authUser);
    }

    async deletePeriod(periodId: string, authUser: AuthUser): Promise<void> {
        if (!periodId) throw new ValidationError("El ID del periodo es obligatorio.");
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }

        await this.periodsRepository.deletePeriod(periodId, authUser);
    }
}