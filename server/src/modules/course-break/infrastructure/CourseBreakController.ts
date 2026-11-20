import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import type { CourseBreakService } from "../application/CourseBreakService.js";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

export class CourseBreakController {
    constructor(private readonly service: CourseBreakService) {}

    getCourseBreaks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(req);
            const courseId = req.params.courseId as string;
            const breaks = await this.service.getCourseBreaks(courseId, auth);
            res.status(200).json({ breaks });
        } catch (e) { next(e) }
    };

    createBreaks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(req);
            const courseId = req.params.courseId as string;
            const { name, days, start_time, end_time } = req.body;
            await this.service.createBreaks(courseId, { name, days, start_time, end_time }, auth);
            res.status(201).send();
        } catch (e) { next(e) }
    };

    updateBreakGroup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(req);
            const courseId = req.params.courseId as string;
            const { ids, name, days, start_time, end_time } = req.body;
            await this.service.updateBreakGroup(courseId, { ids, name, days, start_time, end_time }, auth);
            res.status(204).send();
        } catch (e) { next(e) }
    };

    deleteBreaks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(req);
            const courseId = req.params.courseId as string;
            const { ids } = req.body;
            await this.service.deleteBreaks(courseId, ids, auth);
            res.status(204).send();
        } catch (e) { next(e) }
    };
}