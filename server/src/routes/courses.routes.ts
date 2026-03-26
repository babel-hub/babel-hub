import Router  from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { strictLimiter } from "../middleware/ratelimit.middleware.js";
import { createCourse, getAllCourses, getCourseDetails, deleteCourse, updateCourse, getAvailableSubjectsForCourse, getTeacherCourse } from "../controllers/courses.controller.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getAllCourses
);

router.get(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getCourseDetails
);

router.get(
    "/course/:courseId",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    getAvailableSubjectsForCourse
);

router.get(
    "/teacher/course",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    getTeacherCourse
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    createCourse
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    updateCourse
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    deleteCourse
)

export default router;