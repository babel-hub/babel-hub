import type {
    ISchoolRepository
} from "../domain/ISchoolRepository.js";
import type {
    CreateSchoolPayload,
    PrincipalForSchool
} from "../domain/School.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireMaster } from "../../shared/auth/requireMaster.js";
import { normalizeText, normalizeOptionalText } from "../../shared/domain/normalize.js";

export class SchoolService {
    constructor(private readonly schoolRepository: ISchoolRepository) {}

    private normalizePrincipal(principal: PrincipalForSchool): PrincipalForSchool {
        return {
            firstName: normalizeText(principal.firstName),
            middleName: normalizeOptionalText(principal.middleName),
            firstLastName: normalizeText(principal.firstLastName),
            secondLastName: normalizeOptionalText(principal.secondLastName),
            email: normalizeText(principal.email),
            password: principal.password,
        };
    }

    private validate(payload: CreateSchoolPayload): void {
        if (!payload.schoolName?.trim()) {
            throw new ValidationError("El nombre del colegio es obligatorio");
        }

        const p = payload.principal;
        if (!p.firstName?.trim() || !p.firstLastName?.trim() || !p.email?.trim() || !p.password) {
            throw new ValidationError("Faltan campos obligatorios del director");
        }
    }

    async createSchool(payload: CreateSchoolPayload, authUser: AuthUser): Promise<void> {
        const auth = requireMaster(authUser);

        this.validate(payload);

        const normalized: CreateSchoolPayload = {
            schoolName: normalizeText(payload.schoolName),
            principal: this.normalizePrincipal(payload.principal),
        };

        await this.schoolRepository.createSchool(normalized, auth);
    }
}