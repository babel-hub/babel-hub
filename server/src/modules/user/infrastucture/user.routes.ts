import { Router } from 'express';
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import { PostgresUserRepository } from "./PostgresUserRepository.js";
import { UserService } from "../application/UserService.js";
import { UserController } from "./UserControllers.js";
import {authorizedRoles} from "../../../middleware/role.middleware.js";

const repository = new PostgresUserRepository();
const service = new UserService(repository);
const controllers = new UserController(service);

const router: Router = Router();

router.get("/", authMiddleware, controllers.getUser);

router.get(
    "/search",
    authMiddleware,
    authorizedRoles(['principal', 'admin']),
    controllers.getUsersByName
);


export default router;