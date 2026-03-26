import Router from "express";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";
import { getArea, getAreas, deleteArea, insertArea, updateArea, getSubjectsByArea } from "../controllers/areas.controllers.js";

const router = Router();

router.get(
    '/',
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    getAreas
);

router.get(
    '/:id',
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    getArea
);

router.get(
    "/:areaId/subjects",
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    getSubjectsByArea
);

router.post(
    '/',
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    insertArea
);

router.put(
    '/:id',
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    updateArea
);

router.delete(
    '/:id',
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    deleteArea
);

export default router;