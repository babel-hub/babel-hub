import { Router } from 'express';
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresParentRepository } from "./PostgresParentRepository.js";
import { ParentService } from "../application/ParentService.js";
import { ParentControllers } from "./ParentControllers.js";
import { PostgresGradeRepository } from "../../grade/infrastructure/PostgresGradeRepository.js";
import { PostgresAttendanceRepository } from "../../attendance/infrastructure/PostgresAttendanceRepository.js";

const parentRepository = new PostgresParentRepository();
const gradeRepository = new PostgresGradeRepository();
const attendanceRepository = new PostgresAttendanceRepository();

const service = new ParentService(parentRepository, gradeRepository, attendanceRepository);
const controllers = new ParentControllers(service);

const router: Router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.getParents
)

router.get(
    "/students",
    authMiddleware,
    authorizedRoles(['parent']),
    controllers.getParentStudents
)

router.get(
    "/student/:studentId/period/:periodId/grades",
    authMiddleware,
    authorizedRoles(['parent']),
    controllers.getStudentGrades
)

router.get(
    "/student/:studentId/daily/attendance",
    authMiddleware,
    authorizedRoles(['parent']),
    controllers.getStudentDailyAttendance
)

router.get(
    "/student/:studentId/daily/grades",
    authMiddleware,
    authorizedRoles(['parent']),
    controllers.getStudentDailyGrades
)

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.createParent
);

router.post(
    "/link",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.linkParentToStudent
)

router.delete(
    "/:parentId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.deleteParent
)

export default router;