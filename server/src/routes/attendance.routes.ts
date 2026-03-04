import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { getClassAttendance, bulkUpsertClassAttendance, getCourseDailySummary, getAttendanceCenterSummary } from "../controllers/attendance.controller.js";

const router = Router();

router.get(
    "/class/:classId",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal", "admin"]),
    getClassAttendance
);

router.get(
    "/course/:courseId/summary",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal", "admin"]),
    getCourseDailySummary
);

router.get(
    "/summary",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getAttendanceCenterSummary
);

router.post(
    "/class/:classId/bulk",
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    bulkUpsertClassAttendance
);

export default router;
