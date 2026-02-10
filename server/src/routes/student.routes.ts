import { Router } from "express";
import {getStudentById, getStudents, registerStudent} from "../controllers/student.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    registerStudent
);

router.get(
    '/',
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'teacher', 'admin']),
    getStudents
);

router.get(
    '/:id',
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'teacher', 'student', 'admin']),
    getStudentById
)

export default router;