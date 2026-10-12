import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { AuthUser } from "../domain/Shared.types.js";
import { UnauthorizedError } from "../../errors/domain/CustomErrors.js";

export function getAuthUser(req: AuthenticatedRequest): AuthUser {
    if (!req.authUser) throw new UnauthorizedError("Credenciales del usuario inválidas");
    return req.authUser;
}