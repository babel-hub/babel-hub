import { Router } from 'express';
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresSubjectRepository } from "./PostgresSubjectRepository.js";
import { SubjectServices } from "../application/SubjectServices.js";
import { SubjectControllers } from "./SubjectControllers.js";
import {PostgresAssignmentRepository} from "../../assignments/infrastructure/PostgersAssigmentRepository.js";

const subjectRepository = new PostgresSubjectRepository();
const assignmentRepository = new PostgresAssignmentRepository();
const service = new SubjectServices(subjectRepository, assignmentRepository);
const controller = new SubjectControllers(service);

const router: Router = Router();

router.get(
    "/available",
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.getAvailableSubjects
);

router.get(
    "/area/:areaId",
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.getSubjectsByArea
);

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.createSubject
);

router.put(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.updateSubject
);

router.delete(
    "/:id",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.deleteSubject
);

export default router;