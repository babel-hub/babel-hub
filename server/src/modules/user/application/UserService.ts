import type { IUserRepository } from "../domain/IUserRepository.js";
import type { GetUsersByNamePayload, UserProfileResponse, UserSearch } from "../domain/User.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    async getUser(authUserId: string): Promise<UserProfileResponse> {
        if (!authUserId) throw new ValidationError("No se pudo identificar al usuario");
        const user = await this.userRepository.getUser(authUserId);
        if (!user) throw new NotFoundError("Usuario no existe");
        return user;
    }

    async getUsersByName(query: string, limit: number, authUser: AuthUser): Promise<UserSearch[]> {
        const auth = requireAuth(authUser);
        if (!query?.trim()) throw new ValidationError("El término de búsqueda es obligatorio");

        const payload: GetUsersByNamePayload = { query: query.trim(), limit };
        return this.userRepository.getUsersByName(payload, auth);
    }
}