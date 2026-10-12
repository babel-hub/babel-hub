import type { PrincipalService } from "../application/PrincipalService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreatePrincipalPayload } from "../domain/Principal.types.js";


export class PrincipalController {
    constructor(private readonly principalService: PrincipalService) {}

    createPrincipal = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const { email, password, firstName, middleName, firstLastName, secondLastName } = request.body;

            const payload: CreatePrincipalPayload = {
                email, password, firstName, middleName, firstLastName, secondLastName,
                userName: undefined,
                phone: undefined
            };

            const principal = await this.principalService.createPrincipal(payload, authUser);
            response.status(201).json({ principal });
        } catch (error) {
            next(error);
        }
    };
}