import { Router } from 'express';
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresClassRepository } from "./PostgresClassRepository.js";
import { ClassService } from "../application/ClassService.js";
import { ClassControllers } from "./ClassControllers.js";
import {PostgresStudentRepository} from "../../student/infrastructure/PostgresStudentRepository.js";

const classRepository = new PostgresClassRepository();
const studentRepository = new PostgresStudentRepository();
const service = new ClassService(classRepository, studentRepository);
const controller = new ClassControllers(service);

const router: Router = Router();

router.get(
    "/teacher/classes",
    authMiddleware,
    authorizedRoles(["teacher"]),
    controller.getTeacherClasses
);

router.get(
    "/:id",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.getClassDetails
);

router.get(
    "/:classId/teacher",
    authMiddleware,
    authorizedRoles(["teacher"]),
    controller.getTeacherClassDetails
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.createClass
);

router.put(
    "/:classId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.updateClass
)

router.delete(
    "/:classId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.deleteClass
);

export default router;
