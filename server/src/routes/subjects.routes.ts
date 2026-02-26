import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { getAllSubjects } from "../controllers/subjects.controllers.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.get("/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    getAllSubjects
);

export default router;