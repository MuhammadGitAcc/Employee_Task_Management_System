import type { Request, Response } from "express";
import { publish } from "../realtime/chat.hub.js";
import {
  taskInputSchema,
  taskStatusInputSchema,
} from "../schemas/task.schemas.js";
import * as tasksService from "../services/tasks.service.js";
import { getIdParam, getRequestUser } from "../utils/request.js";
import { parseOrThrow } from "../utils/validate.js";

export const listTasks = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  res.json({ tasks: await tasksService.listTasks() });
};

export const createTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(taskInputSchema, req.body);
  const task = await tasksService.createTask(input, getRequestUser(req));
  publish({ type: "tasks-changed" });
  res.status(201).json({ task });
};

export const updateTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseOrThrow(taskInputSchema, req.body);
  const task = await tasksService.updateTask(
    getIdParam(req),
    input,
    getRequestUser(req),
  );
  publish({ type: "tasks-changed" });
  res.json({ task });
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { status } = parseOrThrow(taskStatusInputSchema, req.body);
  const task = await tasksService.updateTaskStatus(
    getIdParam(req),
    status,
    getRequestUser(req),
  );
  publish({ type: "tasks-changed" });
  res.json({ task });
};

export const deleteTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await tasksService.deleteTask(getIdParam(req));
  publish({ type: "tasks-changed" });
  res.status(204).end();
};
