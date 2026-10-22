import type { Request, Response } from "express";
import { commentInputSchema } from "../schemas/comment.schemas.js";
import * as commentsService from "../services/comments.service.js";
import { getIdParam, getRequestUser } from "../utils/request.js";
import { parseOrThrow } from "../utils/validate.js";

export const listComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.json({ comments: await commentsService.listComments(getIdParam(req)) });
};

export const addComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(commentInputSchema, req.body);
  const comment = await commentsService.addComment(
    getIdParam(req),
    input,
    getRequestUser(req),
  );
  res.status(201).json({ comment });
};

export const listActivity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.json({ activity: await commentsService.listActivity(getIdParam(req)) });
};
