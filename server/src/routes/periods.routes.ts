import { Router } from "express";
import { getAcademicPeriods, postAcademicPeriods, updateAcademicPeriod, deleteAcademicPeriod } from "../controllers/periods.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getAcademicPeriods
);

router.post(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    postAcademicPeriods
);

router.put(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    updateAcademicPeriod
);

router.delete(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    deleteAcademicPeriod
);

export default router;