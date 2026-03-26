import { Router } from "express";
import { getStudentById, getStudents, registerStudent, deleteStudent, updateStudent } from "../controllers/student.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.get(
    '/',
    authMiddleware,
    authorizedRoles(['principal', 'teacher', 'admin']),
    getStudents
);

router.get(
    '/:id',
    authMiddleware,
    authorizedRoles(['principal', 'teacher', 'student', 'admin']),
    getStudentById
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    registerStudent
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    updateStudent
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    deleteStudent
);

export default router;