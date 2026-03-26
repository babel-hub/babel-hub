import { Router } from 'express';
import { createPrincipal } from "../controllers/principal.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    createPrincipal
);

export default router;