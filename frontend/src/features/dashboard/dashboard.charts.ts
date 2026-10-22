import { TASK_PRIORITIES, TASK_STATUSES } from "~/features/tasks/task.types";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "~/features/tasks/task.types";

export interface ChartDatum {
  label: string;
  value: number;
  barClass: string;
}

const STATUS_BAR_CLASSES: Record<TaskStatus, string> = {
  "To Do": "bg-gray-400",
  "In Progress": "bg-blue-500",
  Done: "bg-green-500",
};

const PRIORITY_BAR_CLASSES: Record<TaskPriority, string> = {
  Low: "bg-gray-400",
  Medium: "bg-yellow-500",
  High: "bg-red-500",
};

const ASSIGNEE_BAR_CLASS = "bg-blue-500";
const UNASSIGNED_LABEL = "Unassigned";

export const getStatusData = (tasks: Task[]): ChartDatum[] =>
  TASK_STATUSES.map((status) => ({
    label: status,
    value: tasks.filter((task) => task.status === status).length,
    barClass: STATUS_BAR_CLASSES[status],
  }));

export const getPriorityData = (tasks: Task[]): ChartDatum[] =>
  TASK_PRIORITIES.map((priority) => ({
    label: priority,
    value: tasks.filter((task) => task.priority === priority).length,
    barClass: PRIORITY_BAR_CLASSES[priority],
  }));

export const getAssigneeData = (tasks: Task[]): ChartDatum[] => {
  const counts = new Map<string, number>();
  tasks.forEach((task) => {
    const name = task.assignedTo.trim() || UNASSIGNED_LABEL;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });

  const data = Array.from(counts, ([label, value]) => ({
    label,
    value,
    barClass: ASSIGNEE_BAR_CLASS,
  }));

  return data.sort(
    (a, b) => b.value - a.value || a.label.localeCompare(b.label)
  );
};
