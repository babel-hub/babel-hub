import { Router } from 'express';
import {strictLimiter} from "../../../middleware/ratelimit.middleware.js";
import {authMiddleware} from "../../../middleware/auth.middleware.js";
import {authorizedRoles} from "../../../middleware/role.middleware.js";

import { PostgresClassScheduleRepository } from "./PostgresClassScheduleRepository.js";
import { ClassScheduleService } from "../application/ClassScheduleService.js";
import { ClassScheduleControllers } from "./ClassScheduleControllers.js";

const repository = new PostgresClassScheduleRepository();
const service = new ClassScheduleService(repository);
const controller = new ClassScheduleControllers(service);

const router: Router = Router();

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.createClassSchedule
)

router.delete(
    "/:scheduleId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.deleteClassSchedule
)

router.put(
    "/:scheduleId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.updateClassSchedule
)

export default router;