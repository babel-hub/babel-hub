import Router from "express";
import { createClass, getClassInfo, getAllClasses } from "../controllers/classes.controllers.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

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

router.post(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    createClass
);

export default router;