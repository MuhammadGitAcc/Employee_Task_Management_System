import type { Request, Response } from "express";
import { publish } from "../realtime/chat.hub.js";
import {
  resetPasswordSchema,
  userCreateSchema,
  userUpdateSchema,
} from "../schemas/user.schemas.js";
import * as usersService from "../services/users.service.js";
import { getIdParam, getRequestUser } from "../utils/request.js";
import { parseOrThrow } from "../utils/validate.js";

export const listUsers = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  res.json({ users: await usersService.listUsers() });
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(userCreateSchema, req.body);
  res.status(201).json({ user: await usersService.createUser(input) });
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(userUpdateSchema, req.body);
  res.json({ user: await usersService.updateUser(getIdParam(req), input) });
};

export const deactivateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getIdParam(req);
  await usersService.deactivateUser(id, getRequestUser(req).id);
  publish({ type: "user-removed", userId: id });
  publish({ type: "tasks-changed" });
  res.status(204).end();
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(resetPasswordSchema, req.body);
  await usersService.resetPassword(getIdParam(req), input.newPassword);
  res.status(204).end();
};
