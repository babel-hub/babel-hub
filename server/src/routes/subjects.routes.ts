import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { getAllSubjects, createSubject, deleteSubject, getSubject, updateSubject } from "../controllers/subjects.controllers.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    getAllSubjects
);

router.get(
    "/:id",
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    getSubject
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    createSubject
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    updateSubject
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    deleteSubject
);

export default router;