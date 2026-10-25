import type { Task } from "./task.types";

export const UNASSIGNED_LABEL = "Unassigned";
export const UNASSIGNED_FILTER = "__unassigned__";

const normalize = (name: string): string => name.trim().toLowerCase();

export const isUnassigned = (task: Pick<Task, "assignedTo">): boolean =>
  task.assignedTo.trim() === "";

export const getAssigneeLabel = (task: Pick<Task, "assignedTo">): string =>
  isUnassigned(task) ? UNASSIGNED_LABEL : task.assignedTo;

export const isAssignedTo = (
  task: Pick<Task, "assignedTo">,
  name: string
): boolean => {
  const target = normalize(name);
  return target !== "" && normalize(task.assignedTo) === target;
};
