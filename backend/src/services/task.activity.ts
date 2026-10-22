import type { ApiTask } from "./task.mapper.js";

const TRACKED_FIELDS = [
  { key: "title", label: "title" },
  { key: "description", label: "description" },
  { key: "status", label: "status" },
  { key: "priority", label: "priority" },
  { key: "dueDate", label: "due date" },
  { key: "assignedTo", label: "assignee" },
] as const;

export type TaskFields = Pick<ApiTask, (typeof TRACKED_FIELDS)[number]["key"]>;

export const describeTaskChanges = (
  before: TaskFields,
  after: TaskFields,
): string[] =>
  TRACKED_FIELDS.filter(({ key }) => before[key] !== after[key]).map(
    ({ key, label }) =>
      key === "description"
        ? "updated the description"
        : `changed ${label} from "${before[key]}" to "${after[key]}"`,
  );
