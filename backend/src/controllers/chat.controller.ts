import type { Request, Response } from "express";
import { chatMessageInputSchema } from "../schemas/chat.schemas.js";
import * as chatService from "../services/chat.service.js";
import { HttpError } from "../utils/httpError.js";
import { getRequestUser } from "../utils/request.js";
import { parseOrThrow } from "../utils/validate.js";

const getChannelParam = (req: Request): string => {
  const { channelId } = req.params;

  if (typeof channelId !== "string" || !channelId) {
    throw new HttpError(400, "Invalid channel");
  }

  return channelId;
};

export const listMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.json({ messages: await chatService.listMessages(getChannelParam(req)) });
};

export const addMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(chatMessageInputSchema, req.body);
  const message = await chatService.addMessage(
    getChannelParam(req),
    input,
    getRequestUser(req),
  );
  res.status(201).json({ message });
};
