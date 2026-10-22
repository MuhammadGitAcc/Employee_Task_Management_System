import { Router } from "express";
import * as commentsController from "../controllers/comments.controller.js";
import * as tasksController from "../controllers/tasks.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get("/", tasksController.listTasks);
tasksRouter.post(
  "/",
  requireRole("Admin", "Manager"),
  tasksController.createTask,
);
tasksRouter.put(
  "/:id",
  requireRole("Admin", "Manager"),
  tasksController.updateTask,
);
tasksRouter.patch("/:id/status", tasksController.updateTaskStatus);
tasksRouter.delete("/:id", requireRole("Admin"), tasksController.deleteTask);

tasksRouter.get("/:id/comments", commentsController.listComments);
tasksRouter.post("/:id/comments", commentsController.addComment);
tasksRouter.get("/:id/activity", commentsController.listActivity);
