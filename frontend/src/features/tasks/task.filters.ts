import { UNASSIGNED_FILTER, isUnassigned } from "./task.assignee";
import type { Task, TaskPriority, TaskStatus } from "./task.types";

export type SortOrder = "asc" | "desc";

export interface TaskFilterState {
  search: string;
  status: TaskStatus | "All";
  priority: TaskPriority | "All";
  assignee: string;
  sort: SortOrder;
}

export const DEFAULT_FILTERS: TaskFilterState = {
  search: "",
  status: "All",
  priority: "All",
  assignee: "All",
  sort: "asc",
};

export const filterTasks = (
  tasks: Task[],
  filters: TaskFilterState
): Task[] => {
  const query = filters.search.trim().toLowerCase();
  const direction = filters.sort === "asc" ? 1 : -1;

  return tasks
    .filter((task) => {
      if (filters.status !== "All" && task.status !== filters.status) {
        return false;
      }
      if (filters.priority !== "All" && task.priority !== filters.priority) {
        return false;
      }
      if (filters.assignee === UNASSIGNED_FILTER) {
        if (!isUnassigned(task)) return false;
      } else if (
        filters.assignee !== "All" &&
        task.assignedTo !== filters.assignee
      ) {
        return false;
      }
      if (query) {
        const text = `${task.title} ${task.description}`.toLowerCase();
        return text.includes(query);
      }
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) * direction);
};
