import type { AnnouncementService } from "../application/AnnouncementService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";

export class AnnouncementsController {
    constructor(private readonly announcementService: AnnouncementService) {}

    getFeed = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const schoolId = request.user?.schoolId as string;
            const role = request.user?.role as string;

            const profileId = request.query.profileId as string;
            const courseId = request.query.courseId as string;

            const auth = {
                userId: request.user?.userId as string,
                userSchoolId: request.user?.schoolId as string,
                userRole: request.user?.role as string,
            };

            const feed = await this.announcementService.getFeed(schoolId, profileId, role, auth, courseId);
            response.status(200).json({ feed });
        } catch (error: any) {
            next(error);
        }
    }

    createAnnouncement = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const { title, description, type, caption, targetType: target_type, targetValue: target_value } = request.body;

            const auth = {
                userId: request.user?.userId as string,
                userSchoolId: request.user?.schoolId as string,
                userRole: request.user?.role as string,
            };

            await this.announcementService.createAnnouncement({ title, description, type, caption, target_type, target_value }, auth);
            response.status(201).send();
        } catch (error: any) {
            next(error);
        }
    }

    updateAnnouncement = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const announcementId = request.params.id as string;
            const { title, description, type, caption, targetType: target_type, targetValue: target_value } = request.body;

            const auth = {
                userId: request.user?.userId as string,
                userSchoolId: request.user?.schoolId as string,
                userRole: request.user?.role as string,
            };

            await this.announcementService.updateAnnouncement(
                {
                    announcementId, title, description, target_type, type, caption, target_value,
                },
                auth
            );

            response.status(200).send();
        } catch (error: any) {
            next(error);
        }
    }

    deleteAnnouncement = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const announcementId = request.params.id as string;

            const auth = {
                userId: request.user?.userId as string,
                userSchoolId: request.user?.schoolId as string,
                userRole: request.user?.role as string,
            };

            await this.announcementService.deleteAnnouncement(announcementId, auth);

            response.status(204).send();
        } catch (error: any) {
            next(error);
        }
    }
}