import { Router } from 'express';
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { AttendanceService } from "../application/AttendanceService.js";
import { PostgresAttendanceRepository } from "./PostgresAttendanceRepository.js";
import { AttendanceController } from "./AttendanceControllers.js";

const repository = new PostgresAttendanceRepository();
const service = new AttendanceService(repository);
const controller = new AttendanceController(service);

const router: Router = Router();

router.get(
    "/summary",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.getAttendanceSummary
);

router.get(
    "/summary/calendar",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.getCalendarAttendance
);

router.get(
    "/class/:classId",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal", "admin"]),
    controller.getDailyClassAttendance
);

router.get(
    "/course/:courseId/summary",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal", "admin"]),
    controller.getDailyCourseAttendance
);

router.get(
    "/course/:courseId/class/:classId",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    controller.getClassAttendance
);

router.post(
    "/class/:classId/bulk",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.bulkUpsertAttendance
);

export default router;