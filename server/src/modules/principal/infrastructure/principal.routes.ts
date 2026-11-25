import { Router } from 'express';
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { authorizedRoles } from "../../../middleware/role.middleware.js";
import { strictLimiter } from "../../../middleware/ratelimit.middleware.js";

import { PrincipalController } from "./PrincipalControllers.js";
import { PrincipalDashboardController } from "./PrincipalDashboardController.js";
import { principalService, principalDashboardService } from "./PrincipalDashboardRoutes.js";

const controller = new PrincipalController(principalService);
const dashboardController = new PrincipalDashboardController(principalDashboardService)

const router: Router = Router();

router.post(
    "/",
    strictLimiter,
    authMiddleware,
    authorizedRoles(["admin"]),
    controller.createPrincipal
);

router.get(
    "/dashboard",
    authMiddleware,
    authorizedRoles(["principal", "admin"]),
    dashboardController.getDashboard
);

export default router;