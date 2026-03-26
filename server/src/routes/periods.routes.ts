import { Router } from "express";
import { getAcademicPeriods, postAcademicPeriods, updateAcademicPeriod, deleteAcademicPeriod } from "../controllers/periods.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    getAcademicPeriods
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    postAcademicPeriods
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    updateAcademicPeriod
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    deleteAcademicPeriod
);

export default router;