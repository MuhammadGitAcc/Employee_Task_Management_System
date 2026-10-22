import { getDueState } from "~/features/tasks/task.due";
import type { Task } from "~/features/tasks/task.types";

export interface TaskStats {
  total: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export const getTaskStats = (tasks: Task[]): TaskStats => ({
  total: tasks.length,
  inProgress: tasks.filter((task) => task.status === "In Progress").length,
  done: tasks.filter((task) => task.status === "Done").length,
  overdue: tasks.filter((task) => getDueState(task) === "overdue").length,
});
