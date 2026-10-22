import React from "react";
import Badge from "~/components/ui/Badge";
import Card from "~/components/ui/Card";
import { getDueState } from "~/features/tasks/task.due";
import type { Task } from "~/features/tasks/task.types";

interface TaskListWidgetProps {
  title: string;
  tasks: Task[];
  emptyText: string;
  showAssignee?: boolean;
}

const TaskListWidget: React.FC<TaskListWidgetProps> = ({
  title,
  tasks,
  emptyText,
  showAssignee = false,
}) => {
  return (
    <Card as="section">
      <h2 className="text-lg font-semibold text-gray-800 mb-2 dark:text-gray-100">
        {title}
      </h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {tasks.map((task) => {
            const dueState = getDueState(task);
            return (
              <li
                key={task.id}
                className="py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate dark:text-gray-100">
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due {task.dueDate} · {task.status}
                    {showAssignee && ` · ${task.assignedTo}`}
                  </p>
                </div>
                {dueState === "overdue" && <Badge tone="red">Overdue</Badge>}
                {dueState === "due-soon" && (
                  <Badge tone="yellow">Due soon</Badge>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default TaskListWidget;
