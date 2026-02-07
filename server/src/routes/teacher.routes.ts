import { Router } from 'express';
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { registerTeacher } from "../controllers/teacher.controller.js";
import {strictLimiter} from "../middleware/ratelimit.middleware.js";

const router = Router();

router.post(
    "/teacher",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal"]),
    registerTeacher);

export default router;