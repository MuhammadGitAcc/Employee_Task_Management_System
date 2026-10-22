import { prisma } from "../lib/prisma.js";
import type { TaskInput } from "../schemas/task.schemas.js";
import type { AuthUser } from "../types/auth.types.js";
import { HttpError } from "../utils/httpError.js";
import { hasErrorCode } from "../utils/prismaErrors.js";
import { describeTaskChanges } from "./task.activity.js";
import {
  type ApiTask,
  type ApiTaskStatus,
  STATUS_FROM_API,
  toApiTask,
  toDbDate,
} from "./task.mapper.js";

const taskInclude = { assignee: { select: { name: true } } } as const;

const findTaskOrThrow = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  return task;
};

const findAssigneeOrThrow = async (id: string) => {
  const assignee = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!assignee) {
    throw new HttpError(400, "Validation failed", {
      assigneeId: "Selected employee does not exist.",
    });
  }

  return assignee;
};

export const listTasks = async (): Promise<ApiTask[]> => {
  const tasks = await prisma.task.findMany({
    include: taskInclude,
    orderBy: { createdAt: "asc" },
  });

  return tasks.map(toApiTask);
};

export const createTask = async (
  input: TaskInput,
  actor: AuthUser,
): Promise<ApiTask> => {
  await findAssigneeOrThrow(input.assigneeId);

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: STATUS_FROM_API[input.status],
      priority: input.priority,
      dueDate: toDbDate(input.dueDate),
      assigneeId: input.assigneeId,
      activity: {
        create: { actorId: actor.id, message: "created this task" },
      },
    },
    include: taskInclude,
  });

  return toApiTask(task);
};

export const updateTask = async (
  id: string,
  input: TaskInput,
  actor: AuthUser,
): Promise<ApiTask> => {
  const existing = await findTaskOrThrow(id);
  const assignee = await findAssigneeOrThrow(input.assigneeId);

  const changes = describeTaskChanges(toApiTask(existing), {
    ...input,
    assignedTo: assignee.name,
  });

  const [task] = await prisma.$transaction([
    prisma.task.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        status: STATUS_FROM_API[input.status],
        priority: input.priority,
        dueDate: toDbDate(input.dueDate),
        assigneeId: input.assigneeId,
      },
      include: taskInclude,
    }),
    prisma.taskActivity.createMany({
      data: changes.map((message) => ({
        taskId: id,
        actorId: actor.id,
        message,
      })),
    }),
  ]);

  return toApiTask(task);
};

export const updateTaskStatus = async (
  id: string,
  status: ApiTaskStatus,
  actor: AuthUser,
): Promise<ApiTask> => {
  const before = toApiTask(await findTaskOrThrow(id));

  if (before.status === status) {
    return before;
  }

  const [task] = await prisma.$transaction([
    prisma.task.update({
      where: { id },
      data: { status: STATUS_FROM_API[status] },
      include: taskInclude,
    }),
    prisma.taskActivity.create({
      data: {
        taskId: id,
        actorId: actor.id,
        message: `changed status from "${before.status}" to "${status}"`,
      },
    }),
  ]);

  return toApiTask(task);
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await prisma.task.delete({ where: { id } });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      throw new HttpError(404, "Task not found");
    }
    throw error;
  }
};
