import { z } from "zod";

export const TASK_STATUSES = ["To Do", "In Progress", "Done"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;

const isValidDate = (value: string): boolean => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

export const taskStatusSchema = z.enum(
  TASK_STATUSES,
  "Status must be To Do, In Progress or Done.",
);

export const taskInputSchema = z.object({
  title: z
    .string("Title is required.")
    .trim()
    .min(1, "Title is required.")
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be 100 characters or fewer."),
  description: z
    .string("Description must be text.")
    .trim()
    .max(500, "Description must be 500 characters or fewer."),
  status: taskStatusSchema,
  priority: z.enum(TASK_PRIORITIES, "Priority must be Low, Medium or High."),
  dueDate: z
    .string("Due date is required.")
    .min(1, "Due date is required.")
    .refine(isValidDate, "Enter a valid due date."),
  assigneeId: z
    .string("Assigned to is required.")
    .min(1, "Assigned to is required."),
});

export const taskStatusInputSchema = z.object({ status: taskStatusSchema });

export type TaskInput = z.infer<typeof taskInputSchema>;
