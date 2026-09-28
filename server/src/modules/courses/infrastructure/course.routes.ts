import { Router } from 'express';
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresCourseRepository } from "./PostgresCourseRepository.js";
import { CourseService } from "../application/CourseService.js";
import { CourseController } from "./CourseController.js";
import {PostgresClassRepository} from "../../classes/infrastructure/PostgresClassRepository.js";
import {PostgresStudentRepository} from "../../student/infrastructure/PostgresStudentRepository.js";

const courseRepository = new PostgresCourseRepository();
const classRepository = new PostgresClassRepository();
const studentRepository = new PostgresStudentRepository();
const service = new CourseService(courseRepository, studentRepository, classRepository);
const controller = new CourseController(service);

const router: Router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.getCourses
);

router.get(
    "/teacher/course",
    authMiddleware,
    authorizedRoles(["principal", "admin", "teacher"]),
    controller.getTeacherCourse
);

router.get(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.getCourseDetails
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.createCourse
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.updateCourse
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.deleteCourse
);

export default router;