import type { AnnouncementService } from "../application/AnnouncementService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import type {
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload
} from "../domain/Announcements.types.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class AnnouncementsController {
    constructor(private readonly announcementService: AnnouncementService) {}

    getFeed = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const courseId = request.query.courseId as string | undefined;

            const feed = await this.announcementService.getFeed(courseId, authUser);
            response.status(200).json({ feed });
        } catch (error) {
            next(error);
        }
    };

    createAnnouncement = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const {
                title, description, type, caption,
                targetType: target_type,
                targetValue: target_value
            } = request.body;

            const payload: CreateAnnouncementPayload = {
                title, description, type, caption, target_type, target_value
            };

            await this.announcementService.createAnnouncement(payload, authUser);
            response.status(201).send();
        } catch (error) {
            next(error);
        }
    };

    updateAnnouncement = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const announcementId = request.params.id as string;
            const {
                title, description, type, caption,
                targetType: target_type,
                targetValue: target_value
            } = request.body;

            const payload: UpdateAnnouncementPayload = {
                announcementId, title, description, type, caption, target_type, target_value
            };

            await this.announcementService.updateAnnouncement(payload, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteAnnouncement = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const authUser = getAuthUser(request);
            const announcementId = request.params.id as string;

            await this.announcementService.deleteAnnouncement(announcementId, authUser);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}