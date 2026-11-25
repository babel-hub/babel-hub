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
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.getStudentInfractions
);

router.get(
    "/course/:courseId/student/:studentId/infractions",
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.getStudentInfractionsByCourse
);

router.get(
    "/course/:courseId/student/:studentId/monitoring",
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.getStudentMonitoring
);

router.get(
    "/monitoring/:monitoringId/messages",
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.getMonitoringMessages
);

router.post(
    "/infractions",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.createInfraction
);

router.put(
    "/infraction/:infractionId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.updateInfraction
);

router.patch(
    "/infraction/:infractionId/publish",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    controller.publishInfraction
);

router.delete(
    "/infraction/:infractionId",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.deleteInfraction
);

router.post(
    "/infraction/:infractionId/escalate",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.escalateInfraction
);

router.post(
    "/monitoring/:monitoringId/messages",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["teacher", "principal", "admin"]),
    controller.createMonitoringMessage
);

export default router;