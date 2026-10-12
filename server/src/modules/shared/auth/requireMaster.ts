import type { AuthUser } from "../domain/Shared.types.js";
import { UnauthorizedError } from "../../errors/domain/CustomErrors.js";

export interface MasterAuth {
    userId: string;
    userRole: string;
}

export function requireMaster(authUser: AuthUser | null | undefined): MasterAuth {
    if (!authUser?.userId || !authUser.userRole) {
        throw new UnauthorizedError("Credenciales del usuario inválidas");
    }
    return {
        userId: authUser.userId,
        userRole: authUser.userRole,
    };
}