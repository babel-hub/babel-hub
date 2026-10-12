import type { SchoolService } from "../application/SchoolService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";
import type { CreateSchoolPayload } from "../domain/School.types.js";

export class SchoolControllers {
    constructor(private readonly schoolService: SchoolService) {}

    createSchool = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const {
                schoolName,
                firstName, middleName, firstLastName, secondLastName,
                principalEmail, principalPassword
            } = request.body;

            const payload: CreateSchoolPayload = {
                schoolName,
                principal: {
                    firstName,
                    middleName,
                    firstLastName,
                    secondLastName,
                    email: principalEmail,
                    password: principalPassword
                }
            };

            const school = await this.schoolService.createSchool(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };
}