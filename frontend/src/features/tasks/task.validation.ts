import type { TaskInput } from "./task.types";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

type ValidatedFields = Pick<
  TaskInput,
  "title" | "description" | "dueDate" | "assigneeId"
>;

export type TaskFormErrors = Partial<Record<keyof ValidatedFields, string>>;

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
};

export const validateTask = (values: ValidatedFields): TaskFormErrors => {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < TITLE_MIN_LENGTH) {
    errors.title = `Title must be at least ${TITLE_MIN_LENGTH} characters.`;
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  if (!values.dueDate) {
    errors.dueDate = "Due date is required.";
  } else if (!isValidDate(values.dueDate)) {
    errors.dueDate = "Enter a valid due date.";
  }

  if (!values.assigneeId) {
    errors.assigneeId = "Assigned to is required.";
  }

  return errors;
};
