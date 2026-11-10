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
    authorizedRoles(["teacher", "principal"]),
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

router.get(
    "/course/:courseId/student/:studentId/infractions",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.getStudentInfractionsByCourse
);

router.get(
    "/monitoring/:monitoringId/messages",
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.getMonitoringMessages
);

router.post(
    "/monitoring/:monitoringId/messages",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.createMonitoringMessage
);

router.post(
    "/class/:classId/infractions",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.createInfraction
);

router.post(
    "/infraction/:infractionId/escalate",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.escalateInfraction
);

router.put(
    "/infraction/:infractionId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.updateInfraction
);

router.delete(
    "/infraction/:infractionId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal"]),
    controller.deleteInfraction
);

export default router;
