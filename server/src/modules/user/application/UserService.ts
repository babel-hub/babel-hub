import type { IUserRepository } from "../domain/IUserRepository.js";
import type {UserProfileResponse, UserSearch} from "../domain/User.types.js";
import { NotFoundError, UnauthorizedError } from "../../errors/domain/CustomErrors.js";
import type {AuthUser} from "../../shared/domain/Shared.types.js";

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {}

    private requireAuth(authUser: AuthUser): Required<AuthUser> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales del usuario inválidas");
        }
        return authUser as Required<AuthUser>;
    }

    async getUser(userId: string): Promise<UserProfileResponse> {
        if (!userId) throw new UnauthorizedError("Al cargar el usuario, no cargaron los datos");

        const user = await this.userRepository.getUser(userId);
        if (!user) throw new NotFoundError("Usuario no existe");

        return user;
    }

    async getUsersByName(query: string, authUser: AuthUser, limit: number): Promise<UserSearch[]> {
        const ctx = this.requireAuth(authUser);

        return await this.userRepository.getUsersByName(query, ctx, limit);
    }
}