import { Router } from "express";
import { registerSchool } from "../controllers/school.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {strictLimiter} from "../middleware/ratelimit.middleware.js";

const router = Router();

router.post(
  "/",
  strictLimiter,
  authMiddleware,
  registerSchool,
);

export default router;