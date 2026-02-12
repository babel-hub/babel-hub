import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { getAttendance, upsertAttendance } from "../controllers/attendance.controller.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["student", "teacher", "principal"]),
    getAttendance
);

router.post(
    "/",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    upsertAttendance
);

export default router;
