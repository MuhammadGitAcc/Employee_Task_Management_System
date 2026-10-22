import React, { memo } from "react";
import Badge, { type BadgeTone } from "~/components/ui/Badge";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import { getDueState } from "./task.due";
import type { DueState } from "./task.due";
import type { Task, TaskPriority, TaskStatus } from "./task.types";

type TaskCardProps = Task & {
  onDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const statusTones: Record<TaskStatus, BadgeTone> = {
  "To Do": "yellow",
  "In Progress": "blue",
  Done: "green",
};

const dueClasses: Record<DueState, string> = {
  overdue: "border-l-4 border-l-red-500 dark:border-l-red-500",
  "due-soon": "border-l-4 border-l-yellow-500 dark:border-l-yellow-500",
  none: "",
};

const priorityTones: Record<TaskPriority, BadgeTone> = {
  Low: "green",
  Medium: "yellow",
  High: "red",
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  onDetails,
  onEdit,
  onDelete,
}) => {
  const dueState = getDueState({ dueDate, status });

  return (
    <Card className={`mb-4 ${dueClasses[dueState]}`}>
      <h3 className="text-lg font-semibold text-gray-800 break-words dark:text-gray-100">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mt-2 break-words dark:text-gray-300">
        {description}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
        <Badge tone={statusTones[status]}>{status}</Badge>
        <Badge tone={priorityTones[priority]}>{priority}</Badge>
        <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
          Due: {dueDate}
        </span>
        {dueState === "overdue" && <Badge tone="red">Overdue</Badge>}
        {dueState === "due-soon" && <Badge tone="yellow">Due soon</Badge>}
      </div>
      <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
        Assigned to: {assignedTo}
      </p>
      {(onDetails || onEdit || onDelete) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {onDetails && (
            <Button variant="secondary" onClick={() => onDetails(id)}>
              Details
            </Button>
          )}
          {onEdit && (
            <Button variant="secondary" onClick={() => onEdit(id)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" onClick={() => onDelete(id)}>
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default memo(TaskCard);
