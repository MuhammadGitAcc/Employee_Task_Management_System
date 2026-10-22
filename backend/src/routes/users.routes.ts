import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get("/", usersController.listUsers);
usersRouter.post("/", requireRole("Admin"), usersController.createUser);
usersRouter.put("/:id", requireRole("Admin"), usersController.updateUser);
