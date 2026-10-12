import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {GetUsersByNamePayload, UserProfileResponse, UserSearch} from "./User.types.js";

export interface IUserRepository {
    getUser(authUserId: string): Promise<UserProfileResponse | null>;
    getUsersByName(payload: GetUsersByNamePayload, authUser: AuthUser): Promise<UserSearch[]>;
}