import { isAssignedTo } from "~/features/tasks/task.assignee";
import type { Task } from "~/features/tasks/task.types";
import { getDaysFromTodayISO, getTodayISO } from "~/utils/helpers";

export const MAX_WIDGET_ITEMS = 5;
export const UPCOMING_DAYS = 14;

const NO_DUE_DATE = "9999-12-31";

const byDueDate = (a: Task, b: Task): number =>
  (a.dueDate || NO_DUE_DATE).localeCompare(b.dueDate || NO_DUE_DATE);

export const getMyTasks = (tasks: Task[], userName: string): Task[] => {
  if (!userName) return [];
  return tasks
    .filter((task) => isAssignedTo(task, userName) && task.status !== "Done")
    .sort(byDueDate);
};

export const getUpcomingDeadlines = (tasks: Task[]): Task[] => {
  const today = getTodayISO();
  const last = getDaysFromTodayISO(UPCOMING_DAYS);
  return tasks
    .filter(
      (task) =>
        task.status !== "Done" && task.dueDate >= today && task.dueDate <= last
    )
    .sort(byDueDate);
};
