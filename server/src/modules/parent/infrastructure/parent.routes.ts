import { Router } from 'express';
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresParentRepository } from "./PostgresParentRepository.js";
import { ParentService } from "../application/ParentService.js";
import { ParentControllers } from "./ParentControllers.js";
import { PostgresGradeRepository } from "../../grade/infrastructure/PostgresGradeRepository.js";
import { PostgresAttendanceRepository } from "../../attendance/infrastructure/PostgresAttendanceRepository.js";
import { PostgresCourseBreakRepository } from "../../course-break/infrastructure/PostgresCourseBreak.js";

const parentRepository = new PostgresParentRepository();
const gradeRepository = new PostgresGradeRepository();
const attendanceRepository = new PostgresAttendanceRepository();
const courseBreakRepository = new PostgresCourseBreakRepository();

const service = new ParentService(parentRepository, gradeRepository, attendanceRepository, courseBreakRepository);
const controller = new ParentControllers(service);

const router: Router = Router();

router.get(
    "/",
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controller.getParents
)

router.get(
    "/students",
    authMiddleware,
    authorizedRoles(['parent']),
    controller.getParentStudents
)

router.get(
    "/student/:studentId/period/:periodId/grades",
    authMiddleware,
    authorizedRoles(['parent']),
    controller.getStudentGrades
)

router.get(
    "/student/:studentId/daily/attendance",
    authMiddleware,
    authorizedRoles(['parent']),
    controller.getStudentDailyAttendance
)

router.get(
    "/student/:studentId/daily/grades",
    authMiddleware,
    authorizedRoles(['parent']),
    controller.getStudentDailyGrades
)

router.get(
    "/student/:studentId/accumulated",
    authMiddleware,
    authorizedRoles(['parent']),
    controller.getAccumulatedGradesBySubject
)

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controller.createParent
);

router.post(
    "/link",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controller.linkParentToStudent
)

router.delete(
    "/:parentId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controller.deleteParent
)

router.delete(
    "/student/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controller.deleteParentStudent
)

export default router;