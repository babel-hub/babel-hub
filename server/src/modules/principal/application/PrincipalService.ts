import type { IPrincipalRepository } from "../domain/IPrincipalRepository.js";
import type {CreatePrincipalPayload} from "../domain/Principal.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { normalizeOptionalText } from "../../shared/domain/normalize.js";

export class PrincipalService {
    constructor(private readonly principalRepository: IPrincipalRepository) {}

    private validate(payload: CreatePrincipalPayload): void {
        if (!payload.email?.trim() || !payload.firstName?.trim() || !payload.firstLastName?.trim() || !payload.password?.trim()) {
            throw new ValidationError("Todos los campos deben estar llenos");
        }
    }

    async createPrincipal(payload: CreatePrincipalPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        this.validate(payload);

        const normalized: CreatePrincipalPayload = {
            ...payload,
            middleName: normalizeOptionalText(payload.middleName),
            secondLastName: normalizeOptionalText(payload.secondLastName),
        };

        return this.principalRepository.createPrincipal(normalized, auth);
    }
}