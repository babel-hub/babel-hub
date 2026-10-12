import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { CreatePrincipalPayload } from "./Principal.types.js";


export interface IPrincipalRepository {
    createPrincipal(
        payload: CreatePrincipalPayload,
        authUser: AuthUser
    ): Promise<void>;
}