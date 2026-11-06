import type { CoexistenceService } from "../application/CoexistenceService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import {getAuthUser} from "../../shared/auth/getAuthUser.js";

export class CoexistenceController {
    constructor(
        private readonly coexistenceService: CoexistenceService
    ) {}

    getStudentMonitoring = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const studentId = request.params.studentId as string;

            const monitoring = await this.coexistenceService.getStudentMonitoring({ courseId, studentId }, authUser);
            response.status(200).json({ monitoring });
        } catch (error : any) {
            next(error);
        }
    }

    getStudentInfractions = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;
            const studentId = request.params.studentId as string;

            const infractions = await this.coexistenceService.getStudentInfractions({ classId, studentId }, authUser);
            response.status(200).json({ infractions });
        } catch (error : any) {
            next(error);
        }
    }

    getInfractionTypes = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const types = await this.coexistenceService.getInfractionTypes(authUser);
            response.status(200).json({ types });
        } catch (error) {
            next(error);
        }
    };

    createInfraction = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const classId = request.params.classId as string;
            const { studentId, infractionTypeId, description, escalate, monitoringNotes } = request.body;

            const result = await this.coexistenceService.createInfraction(
                classId,
                {
                    studentId,
                    infractionTypeId,
                    description: description,
                    escalate: Boolean(escalate),
                    monitoringNotes: monitoringNotes,
                },
                authUser
            );

            response.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };
}