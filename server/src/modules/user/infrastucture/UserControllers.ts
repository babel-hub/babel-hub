import type { UserService } from "../application/UserService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction} from "express";

export class UserController {
    constructor( private readonly userService: UserService ) {}

    getUser = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUserId = request.user!.authUserId as string;

            const user = await this.userService.getUser(authUserId);
            response.status(200).json({ responseData: user });
        } catch (error : any) {
            next(error);
        }
    }

    getUsersByName = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const query = request.query.q as string;
            const limit = parseInt(request.query.limit as string, 10) || 10;

            const auth = {
                userSchoolId: request.user!.schoolId as string,
                userRole: request.user!.role as string,
                userId: request.user!.userId as string
            }

            const users = await this.userService.getUsersByName(query, auth, limit);
            response.status(200).json({ users });
        } catch (error : any) {
            next(error);
        }
    }
}