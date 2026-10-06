import type { UserProfileResponse, UserSearch } from "./User.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IUserRepository {
    getUser(userId: string): Promise<UserProfileResponse | null>;
    getUsersByName(query: string, authUser: AuthUser, limit: number): Promise<UserSearch[]>;
}