import { Router } from "express";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresCumulativeRepository } from "./PostgresCumulativeRepository.js";
import { CumulativeService } from "../application/CumulativeService.js";
import { CumulativeControllers } from "./CumulativeControllers.js";
import {PostgresStudentRepository} from "../../student/infrastructure/PostgresStudentRepository.js";

const cumulativeRepository = new PostgresCumulativeRepository();
const studentRepository = new PostgresStudentRepository();
const service = new CumulativeService(cumulativeRepository, studentRepository);
const controller = new CumulativeControllers(service);

const router: Router = Router();

router.get(
    '/:courseId/attendance',
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.getCumulativeAttendance
);

router.get(
    "/:courseId/trend",
    authMiddleware,
    authorizedRoles(["principal", "teacher"]),
    controller.getCoursePeriodTrend
);

router.get(
    "/course/:courseId/fail-stats",
    authMiddleware,
    authorizedRoles(["principal", "teacher"]),
    controller.getCourseFailStats
);

router.get(
    "/course/:courseId/honor-students",
    authMiddleware,
    authorizedRoles(["principal", "teacher"]),
    controller.getCourseHonorStudents
);

router.get(
    '/:courseId/grades',
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.getCumulativeGrades
);

router.get(
    "/student/:studentId/report-card/pdf",
    authMiddleware,
    authorizedRoles(["admin", "principal", "teacher", "parent"]),
    controller.getReportCardPdf
);

router.get(
    '/:courseId/summary',
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.getCumulativeSummary
);

router.get(
    "/:courseId/reports/students",
    authMiddleware,
    authorizedRoles(["admin", "principal", "teacher"]),
    controller.getStudentsForReports
);


export default router;