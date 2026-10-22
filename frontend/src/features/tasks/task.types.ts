export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export const TASK_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];
export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string | null;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssigneeOption {
  id: string;
  name: string;
}

export type TaskInput = Omit<
  Task,
  "id" | "assigneeId" | "assignedTo" | "createdAt" | "updatedAt"
> & { assigneeId: string };
