import { Router } from "express";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresCumulativeRepository } from "./PostgresCumulativeRepository.js";
import { CumulativeService } from "../application/CumulativeService.js";
import { CumulativeControllers } from "./CumulativeControllers.js";

const repository = new PostgresCumulativeRepository();
const service = new CumulativeService(repository);
const controllers = new CumulativeControllers(service);

const router: Router = Router();

router.get(
    '/:courseId/attendance',
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controllers.getCumulativeAttendance
);

router.get(
    "/:courseId/trend",
    authMiddleware,
    authorizedRoles(["principal", "teacher"]),
    controllers.getCoursePeriodTrend
);

router.get(
    '/:courseId/grades',
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controllers.getCumulativeGrades
);

router.get(
    '/:courseId/summary',
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controllers.getCumulativeSummary
);


export default router;