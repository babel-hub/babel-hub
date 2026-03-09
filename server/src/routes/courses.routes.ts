import Router  from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizedRoles } from "../middleware/role.middleware.js";
import { createCourse, getAllCourses, getCourseDetails, deleteCourse, updateCourse, getAvailableSubjectsForCourse } from "../controllers/courses.controller.js";

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

router.post(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    createCourse
);

router.put(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    updateCourse
);

router.delete(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    deleteCourse
)


export default router;