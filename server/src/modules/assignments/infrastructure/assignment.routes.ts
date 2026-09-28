import { Router } from 'express';
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresAssignmentRepository } from "./PostgersAssigmentRepository.js";
import { AssignmentController } from "./AssignmentController.js";
import { AssignmentService } from "../application/AssignmentService.js";

import { PostgresGradeRepository } from "../../grade/infrastructure/PostgresGradeRepository.js";
import { PostgresAssessmentRepository } from "../../assessmentCriteria/infrastructure/PostgresAssessmentRepository.js";

const assignmentRepository = new PostgresAssignmentRepository();
const gradeRepository = new PostgresGradeRepository();
const assessmentRepository = new PostgresAssessmentRepository();

const service = new AssignmentService(assignmentRepository, gradeRepository, assessmentRepository);
const controller = new AssignmentController(service);

const router: Router = Router();

router.get(
    "/periods/:periodId/overview",
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.getAssignmentOverview
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.createAssignment
)

router.patch(
    "/:assignmentId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.updateAssignment
);

router.delete(
    "/:assignmentId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(['principal', 'teacher']),
    controller.deleteAssignment
)

export default router;