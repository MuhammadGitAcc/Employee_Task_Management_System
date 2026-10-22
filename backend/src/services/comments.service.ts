import { prisma } from "../lib/prisma.js";
import type { CommentInput } from "../schemas/comment.schemas.js";
import type { AuthUser } from "../types/auth.types.js";
import { HttpError } from "../utils/httpError.js";

export interface ApiComment {
  id: string;
  taskId: string;
  authorId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ApiActivity {
  id: string;
  taskId: string;
  actorId: string;
  actor: string;
  message: string;
  createdAt: string;
}

const authorInclude = { author: { select: { name: true } } } as const;
const actorInclude = { actor: { select: { name: true } } } as const;

const assertTaskExists = async (taskId: string): Promise<void> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }
};

export const listComments = async (taskId: string): Promise<ApiComment[]> => {
  await assertTaskExists(taskId);

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: authorInclude,
    orderBy: { createdAt: "asc" },
  });

  return comments.map((comment) => ({
    id: comment.id,
    taskId: comment.taskId,
    authorId: comment.authorId,
    author: comment.author.name,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  }));
};

export const addComment = async (
  taskId: string,
  input: CommentInput,
  author: AuthUser,
): Promise<ApiComment> => {
  await assertTaskExists(taskId);

  const comment = await prisma.taskComment.create({
    data: { taskId, authorId: author.id, text: input.text },
  });

  return {
    id: comment.id,
    taskId: comment.taskId,
    authorId: comment.authorId,
    author: author.name,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  };
};

export const listActivity = async (taskId: string): Promise<ApiActivity[]> => {
  await assertTaskExists(taskId);

  const entries = await prisma.taskActivity.findMany({
    where: { taskId },
    include: actorInclude,
    orderBy: { createdAt: "asc" },
  });

  return entries.map((entry) => ({
    id: entry.id,
    taskId: entry.taskId,
    actorId: entry.actorId,
    actor: entry.actor.name,
    message: entry.message,
    createdAt: entry.createdAt.toISOString(),
  }));
};
