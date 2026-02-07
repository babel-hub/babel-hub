import { Router } from "express";
import { registerStudent } from "../controllers/student.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import {strictLimiter} from "../middleware/ratelimit.middleware.js";

const router = Router();

router.post(
    "/students",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal']),
    registerStudent);

export default router;