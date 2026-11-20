import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";
import { CourseBreakService } from "../application/CourseBreakService.js";
import { CourseBreakController } from "./CourseBreakController.js";
import { PostgresCourseBreakRepository } from "./PostgresCourseBreak.js";

const repo = new PostgresCourseBreakRepository();
const service = new CourseBreakService(repo);
const controller = new CourseBreakController(service);

const router: Router = Router();

router.get(
    "/course/:courseId",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    controller.getCourseBreaks
);

router.post(
    "/course/:courseId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.createBreaks
);

router.put(
    "/course/:courseId/group",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.updateBreakGroup
);

router.delete(
    "/course/:courseId/group",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.deleteBreaks
);

export default router;