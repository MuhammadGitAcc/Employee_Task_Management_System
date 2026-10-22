import { Router } from "express";
import * as chatController from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get("/:channelId/messages", chatController.listMessages);
chatRouter.post("/:channelId/messages", chatController.addMessage);
