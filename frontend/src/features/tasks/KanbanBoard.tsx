import React, { useState } from "react";
import Badge from "~/components/ui/Badge";
import TaskCard from "./TaskCard";
import { TASK_STATUSES } from "./task.types";
import type { Task, TaskStatus } from "./task.types";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDetails?: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEdit,
  onDelete,
  onDetails,
  onMove,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const endDrag = () => {
    setDraggingId(null);
    setOverStatus(null);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggingId) onMove(draggingId, status);
    endDrag();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <section
            key={status}
            aria-label={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus(status);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverStatus(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(status);
            }}
            className={`border rounded-lg p-3 ${
              overStatus === status && draggingId
                ? "bg-primary-50 border-primary-400 dark:bg-primary-900/20 dark:border-primary-500"
                : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {status}
              </h2>
              <Badge>{columnTasks.length}</Badge>
            </div>
            {columnTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6 dark:text-gray-400">
                No tasks
              </p>
            ) : (
              columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(task.id);
                  }}
                  onDragEnd={endDrag}
                  className={`cursor-grab ${
                    draggingId === task.id ? "opacity-50" : ""
                  }`}
                >
                  <TaskCard
                    {...task}
                    onDetails={onDetails}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                  <select
                    aria-label={`Move task "${task.title}" to another column`}
                    value={task.status}
                    onChange={(e) =>
                      onMove(task.id, e.target.value as TaskStatus)
                    }
                    className="-mt-2 mb-4 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    {TASK_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </section>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
