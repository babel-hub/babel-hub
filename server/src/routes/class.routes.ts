import Router  from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createClass, assignStudentToClass, getClassInfo, getAllClasses } from "../controllers/class.controller.js";
import { authorizedRoles } from "../middleware/role.middleware.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    authorizedRoles(["principal"]),
    createClass
);

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal"]),
    getAllClasses
);


router.post(
    "/:classId/students",
    authMiddleware,
    authorizedRoles(["principal"]),
    assignStudentToClass
);

router.get(
    "/:id/",
    authMiddleware,
    authorizedRoles(["principal"]),
    getClassInfo
);

export default router;