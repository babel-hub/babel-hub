import { Router } from 'express';
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresCoexistenceRepository } from "./PostgresCoexistenceRepository.js";
import { CoexistenceService } from "../application/CoexistenceService.js";
import { CoexistenceController } from "./CoexistenceControllers.js";

const coexistenceRepository = new PostgresCoexistenceRepository();
const service = new CoexistenceService(coexistenceRepository);
const controller = new CoexistenceController(service);

const router: Router = Router();

router.get(
    "/infraction-types",
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.getInfractionTypes
);

router.get(
    "/class/:classId/student/:studentId/infractions",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.getStudentInfractions
);

router.get(
    "/course/:courseId/student/:studentId/monitoring",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.getStudentMonitoring
);

router.post(
    "/class/:classId/infractions",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.createInfraction
);

export default router;
