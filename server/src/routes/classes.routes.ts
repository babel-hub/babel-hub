import Router from "express";
import { createClass, getClassInfo, getAllClasses, getTeacherClasses, getTeacherClassDetails, deleteClass, updateClass } from "../controllers/classes.controllers.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getAllClasses
);

router.get(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getClassInfo
);

router.get(
    "/teacher/classes",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    getTeacherClasses
);

router.get(
    "/teacher/class/:classId",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    getTeacherClassDetails
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    createClass
);

router.put(
    "/:classId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    updateClass
)

router.delete(
    "/:classId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    deleteClass
);

export default router;