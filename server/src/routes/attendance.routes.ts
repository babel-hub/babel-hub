import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { getAttendance, upsertAttendance, test } from "../controllers/attendance.controller.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal"]),
    getAttendance
);

router.get(
    "/test",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal"]),
    test
);

router.post(
    "/",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    upsertAttendance
);

export default router;
