import type { TaskPriority, TaskStatus } from "../generated/prisma/enums.js";

export type ApiTaskStatus = "To Do" | "In Progress" | "Done";

const STATUS_TO_API: Record<TaskStatus, ApiTaskStatus> = {
  ToDo: "To Do",
  InProgress: "In Progress",
  Done: "Done",
};

export const STATUS_FROM_API: Record<ApiTaskStatus, TaskStatus> = {
  "To Do": "ToDo",
  "In Progress": "InProgress",
  Done: "Done",
};

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assigneeId: string | null;
  assignee: { name: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  status: ApiTaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string | null;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export const toDbDate = (value: string): Date =>
  new Date(`${value}T00:00:00.000Z`);

export const toApiTask = (task: TaskRow): ApiTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: STATUS_TO_API[task.status],
  priority: task.priority,
  dueDate: task.dueDate.toISOString().slice(0, 10),
  assigneeId: task.assigneeId,
  assignedTo: task.assignee?.name ?? "",
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
