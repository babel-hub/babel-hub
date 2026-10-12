import { Router } from 'express';
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import  { authorizedRoles } from "../../../middleware/role.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresTeacherRepository } from "./PostgresTeacherRepository.js";
import { TeacherServices } from "../application/TeacherServices.js";
import { TeacherControllers } from "./TeacherControllers.js";
import { PostgresClassScheduleRepository } from "../../class-schedule/infrastructure/PostgresClassScheduleRepository.js";
import { PostgresAssignmentRepository } from "../../assignments/infrastructure/PostgersAssigmentRepository.js";
import { PostgresClassRepository } from "../../classes/infrastructure/PostgresClassRepository.js";

const teacherRepository = new PostgresTeacherRepository();
const scheduleRepository = new PostgresClassScheduleRepository();
const assignmentRepository = new PostgresAssignmentRepository();
const classRepository = new PostgresClassRepository();
const service = new TeacherServices(teacherRepository, scheduleRepository, assignmentRepository, classRepository);
const controllers = new TeacherControllers(service);

const router: Router = Router();

// NOTE: :teacherId on /:teacherId means teacher.id (role-table PK).
//       :teacherId on /:teacherId/schedule and /:teacherId/calendar means profile.id.

router.get(
    "/",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controllers.getTeachers
);

router.get(
    "/:teacherId",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controllers.getTeacherDetails
);

router.get(
    "/:teacherId/schedule",
    authMiddleware,
    authorizedRoles(["principal", "teacher"]),
    controllers.getTeacherSchedule
)

router.get(
    "/:teacherId/calendar",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controllers.getTeacherCalendar
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controllers.createTeacher
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controllers.updateTeacher
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controllers.deleteTeacher
);

export default router;