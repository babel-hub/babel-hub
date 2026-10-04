import { Router } from 'express';
import {strictLimiter} from "../../../middleware/ratelimit.middleware.js";
import {authMiddleware} from "../../../middleware/auth.middleware.js";
import {authorizedRoles} from "../../../middleware/role.middleware.js";

import { PostgresAnnouncementsRepository } from "./PostgresAnnouncementsRepository.js";
import { AnnouncementService } from "../application/AnnouncementService.js";
import { AnnouncementsController } from "./AnnouncementsControllers.js";

const announcementRepository = new PostgresAnnouncementsRepository();
const service = new AnnouncementService(announcementRepository);
const controller = new AnnouncementsController(service);

const router: Router = Router()

router.get (
    "/",
    authMiddleware,
    authorizedRoles(["admin", "parent", "student", "principal", "teacher"]),
    controller.getFeed
)

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.createAnnouncement
)

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.updateAnnouncement
)

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.deleteAnnouncement
)

export default router;