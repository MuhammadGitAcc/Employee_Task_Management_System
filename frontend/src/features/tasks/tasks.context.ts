import { createContext } from "react";
import type { Task, TaskInput, TaskStatus } from "./task.types";

export type TasksStatus = "loading" | "ready" | "error";

export interface TasksContextValue {
  tasks: Task[];
  status: TasksStatus;
  errorMessage: string;
  reload: () => void;
  addTask: (input: TaskInput) => Promise<Task>;
  updateTask: (id: string, input: TaskInput) => Promise<Task>;
  moveTask: (id: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

export const TasksContext = createContext<TasksContextValue | null>(null);
