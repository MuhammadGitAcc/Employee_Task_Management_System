import { getDaysFromTodayISO, getTodayISO } from "~/utils/helpers";
import type { Task } from "./task.types";

export type DueState = "overdue" | "due-soon" | "none";

// A task counts as "due soon" when it is due within this many days
export const DUE_SOON_DAYS = 3;

export const getDueState = (
  task: Pick<Task, "dueDate" | "status">
): DueState => {
  if (task.status === "Done" || !task.dueDate) return "none";
  if (task.dueDate < getTodayISO()) return "overdue";
  if (task.dueDate <= getDaysFromTodayISO(DUE_SOON_DAYS)) return "due-soon";
  return "none";
};
