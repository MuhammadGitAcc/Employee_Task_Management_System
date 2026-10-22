import type { Task } from "./task.types";

const normalize = (name: string): string => name.trim().toLowerCase();

export const isAssignedTo = (
  task: Pick<Task, "assignedTo">,
  name: string
): boolean => {
  const target = normalize(name);
  return target !== "" && normalize(task.assignedTo) === target;
};
