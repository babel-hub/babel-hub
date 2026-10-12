import { UnauthorizedError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../domain/Shared.types.js";

export function requireAuth(authUser: AuthUser): Required<AuthUser> {
    if (!authUser?.userId || !authUser?.userRole || !authUser?.userSchoolId) {
        throw new UnauthorizedError("Credenciales del usuario inválidas");
    }
    return authUser as Required<AuthUser>;
}