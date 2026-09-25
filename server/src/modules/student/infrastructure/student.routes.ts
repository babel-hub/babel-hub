import { Router } from "express";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresStudentRepository } from "./PostgresStudentRepository.js";
import { PostgresAttendanceRepository } from "../../attendance/infrastructure/PostgresAttendanceRepository.js";
import { PostgresClassRepository } from "../../classes/infrastructure/PostgresClassRepository.js";
import { PostgresGradeRepository } from "../../grade/infrastructure/PostgresGradeRepository.js";
import { PostgresParentRepository } from "../../parent/infrastructure/PostgresParentRepository.js";

import { StudentService } from "../application/StudentService.js";
import { StudentControllers } from "./StudentControllers.js";

const studentRepository = new PostgresStudentRepository();
const attendanceRepository = new PostgresAttendanceRepository();
const gradeRepository = new PostgresGradeRepository();
const parentRepository = new PostgresParentRepository();
const classRepository = new PostgresClassRepository();

const service = new StudentService(
    studentRepository,
    parentRepository,
    gradeRepository,
    classRepository,
    attendanceRepository
);
const controllers = new StudentControllers(service);

const router: Router = Router();

router.get(
    '/',
    authMiddleware,
    authorizedRoles(['principal', 'teacher', 'admin']),
    controllers.getStudents
);

router.get(
    "/search",
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.getStudentsByName
);

router.get(
    '/:id',
    authMiddleware,
    authorizedRoles(['principal', 'teacher', 'admin']),
    controllers.getStudentDetails
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.createStudent
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.updateStudent
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.deleteStudent
);

export default router;