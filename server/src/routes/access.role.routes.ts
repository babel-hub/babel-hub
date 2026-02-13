import { getUserRole } from "../controllers/access-role.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    getUserRole
);

export default router;