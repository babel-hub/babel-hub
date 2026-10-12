import type { UserService } from "../application/UserService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class UserController {
    constructor(private readonly userService: UserService) {}

    getUser = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUserId = request.user!.authUserId as string;

            const user = await this.userService.getUser(authUserId);
            response.status(200).json({ responseData: user });
        } catch (error) {
            next(error);
        }
    };

    getUsersByName = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const query = request.query.q as string;
            const limit = parseInt(request.query.limit as string, 10) || 10;

            const users = await this.userService.getUsersByName(query, limit, authUser);
            response.status(200).json({ users });
        } catch (error) {
            next(error);
        }
    };
}