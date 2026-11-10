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
            const { studentId, codeId, description, escalate, monitoringNotes } = request.body;

            const result = await this.coexistenceService.createInfraction(
                classId,
                {
                    studentId,
                    codeId,
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

    getMonitoringMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(req);
            const monitoringId = req.params.monitoringId as string;
            const messages = await this.coexistenceService.getMonitoringMessages(monitoringId, authUser);
            res.status(200).json({ messages });
        } catch (error) { next(error); }
    };

    createMonitoringMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(req);
            const monitoringId = req.params.monitoringId as string;
            const { message } = req.body;

            const responseMessage = await this.coexistenceService.createMonitoringMessage(
                monitoringId,
                { message },
                authUser
            );
            res.status(201).json({ message: responseMessage });
        } catch (error) { next(error); }
    };

    updateInfraction = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const infractionId = request.params.infractionId as string;
            const { codeId, description } = request.body;

            await this.coexistenceService.updateInfraction(
                { infractionId, codeId, description: description ?? null },
                authUser
            );

            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    getStudentInfractionsByCourse = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const studentId = request.params.studentId as string;

            const infractions = await this.coexistenceService.getStudentInfractionsByCourse(
                { studentId, courseId },
                authUser
            );
            response.status(200).json({ infractions });
        } catch (error) {
            next(error);
        }
    };

    escalateInfraction = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const infractionId = request.params.infractionId as string;
            const { studentId, courseId, monitoringNotes } = request.body;

            await this.coexistenceService.escalateInfraction(infractionId, { studentId, courseId, monitoringNotes }, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteInfraction = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const infractionId = request.params.infractionId as string;

            await this.coexistenceService.deleteInfraction(infractionId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}