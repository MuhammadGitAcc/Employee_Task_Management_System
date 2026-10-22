import type { Task, TaskInput, TaskStatus } from "~/features/tasks/task.types";
import { api } from "./api";

export const listTasks = async (): Promise<Task[]> => {
  const { tasks } = await api.get<{ tasks: Task[] }>("/tasks");
  return tasks;
};

export const createTask = async (input: TaskInput): Promise<Task> => {
  const { task } = await api.post<{ task: Task }>("/tasks", input);
  return task;
};

export const updateTask = async (
  id: string,
  input: TaskInput
): Promise<Task> => {
  const { task } = await api.put<{ task: Task }>(`/tasks/${id}`, input);
  return task;
};

export const updateTaskStatus = async (
  id: string,
  status: TaskStatus
): Promise<Task> => {
  const { task } = await api.patch<{ task: Task }>(`/tasks/${id}/status`, {
    status,
  });
  return task;
};

export const deleteTask = (id: string): Promise<void> =>
  api.delete(`/tasks/${id}`);
