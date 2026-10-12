import { Router } from 'express';
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PostgresAreaRepository } from "./PostgresAreaRepository.js";
import { AreaService } from "../application/AreaService.js";
import { AreaControllers } from "./AreaControllers.js";

import { PostgresSubjectRepository } from "../../subjects/infrastructure/PostgresSubjectRepository.js";

const areaRepository = new PostgresAreaRepository();
const subjectRepository = new PostgresSubjectRepository();
const service = new AreaService(areaRepository, subjectRepository);
const controller = new AreaControllers(service);

const router: Router = Router();

router.get(
    '/',
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.getAreas
);

router.get(
    '/:id',
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.getAreaDetails
);

router.post(
    '/',
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.createArea
);

router.put(
    '/:id',
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.updateArea
);

router.delete(
    '/:id',
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin", "principal"]),
    controller.deleteArea
);

export default router;