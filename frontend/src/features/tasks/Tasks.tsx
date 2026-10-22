import React, { useMemo, useState } from "react";
import PageContainer from "~/components/layout/PageContainer";
import PageHeader from "~/components/layout/PageHeader";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import ConfirmDialog from "~/components/ui/ConfirmDialog";
import EmptyState from "~/components/ui/EmptyState";
import ErrorState from "~/components/ui/ErrorState";
import Modal from "~/components/ui/Modal";
import Skeleton from "~/components/ui/Skeleton";
import { useToast } from "~/components/ui/toast.context";
import { getErrorMessage } from "~/services/api";
import { useEmployees } from "~/features/employees/useEmployees";
import { useAuth } from "~/features/auth/useAuth";
import KanbanBoard from "./KanbanBoard";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";
import TaskDetails from "./TaskDetails";
import TaskForm from "./TaskForm";
import { DEFAULT_FILTERS, filterTasks } from "./task.filters";
import type { TaskFilterState } from "./task.filters";
import type { TaskInput, TaskStatus } from "./task.types";
import { useTaskDetails } from "./useTaskDetails";
import { useTasks } from "./useTasks";

const Tasks: React.FC = () => {
  const { showToast } = useToast();
  const {
    tasks,
    status,
    errorMessage,
    reload,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks();
  const { can } = useAuth();
  const canCreate = can("task:create");
  const canEdit = can("task:edit");
  const canDelete = can("task:delete");
  const { employees } = useEmployees();
  const assigneeOptions = useMemo(
    () =>
      employees
        .map((employee) => ({ id: employee.id, name: employee.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [view, setView] = useState<"list" | "board">("list");
  const visibleTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters]
  );
  const assignees = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.assignedTo))).sort(),
    [tasks]
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingTask = tasks.find((task) => task.id === editingId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingTask = tasks.find((task) => task.id === deletingId);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const detailsTask = tasks.find((task) => task.id === detailsId);
  const details = useTaskDetails(detailsTask?.id ?? null);

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return;
    }
    showToast(`Task "${deletingTask.title}" deleted.`);
    setDeletingId(null);
  };

  const handleUpdate = async (input: TaskInput) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, input);
    showToast(`Task "${input.title}" updated.`);
    setEditingId(null);
  };

  const handleAdd = async (input: TaskInput) => {
    await addTask(input);
    showToast(`Task "${input.title}" added.`);
  };

  const handleMove = async (id: string, nextStatus: TaskStatus) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || task.status === nextStatus) return;
    try {
      await moveTask(id, nextStatus);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return;
    }
    showToast(`"${task.title}" moved to ${nextStatus}.`);
  };

  const handleAddComment = async (text: string) => {
    await details.addComment(text);
    showToast("Comment added.");
  };

  return (
    <PageContainer>
      <PageHeader title="Task Management" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TaskFilters
            filters={filters}
            assignees={assignees}
            onChange={setFilters}
          />
          <div className="mb-4 flex gap-2" role="group" aria-label="Task view">
            <Button
              variant={view === "list" ? "primary" : "secondary"}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List
            </Button>
            <Button
              variant={view === "board" ? "primary" : "secondary"}
              aria-pressed={view === "board"}
              onClick={() => setView("board")}
            >
              Board
            </Button>
          </div>
          <div className="space-y-4">
            {status === "loading" ? (
              <div
                role="status"
                aria-label="Loading tasks"
                className="space-y-4"
              >
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : status === "error" ? (
              <ErrorState
                title="Could not load the tasks"
                description={errorMessage}
                action={<Button onClick={reload}>Try again</Button>}
              />
            ) : visibleTasks.length === 0 ? (
              <EmptyState
                title={
                  tasks.length === 0 ? "No tasks yet" : "No matching tasks"
                }
                description={
                  tasks.length === 0
                    ? canCreate
                      ? "Add your first task using the form."
                      : "No tasks have been added yet."
                    : "Try changing the search or filters."
                }
              />
            ) : view === "board" ? (
              <KanbanBoard
                tasks={visibleTasks}
                onDetails={setDetailsId}
                onEdit={canEdit ? setEditingId : undefined}
                onDelete={canDelete ? setDeletingId : undefined}
                onMove={handleMove}
              />
            ) : (
              visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onDetails={setDetailsId}
                  onEdit={canEdit ? setEditingId : undefined}
                  onDelete={canDelete ? setDeletingId : undefined}
                />
              ))
            )}
          </div>
        </div>
        {canCreate && (
          <div>
            <Card>
              <TaskForm
                onSubmit={handleAdd}
                assigneeOptions={assigneeOptions}
              />
            </Card>
          </div>
        )}
      </div>
      <Modal
        isOpen={editingTask !== undefined}
        onClose={() => setEditingId(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            key={editingTask.id}
            initialData={{
              ...editingTask,
              assigneeId: editingTask.assigneeId ?? "",
            }}
            assigneeOptions={assigneeOptions}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>
      <Modal
        isOpen={detailsTask !== undefined}
        onClose={() => setDetailsId(null)}
        title={detailsTask?.title ?? "Task details"}
      >
        {detailsTask && (
          <TaskDetails
            key={detailsTask.id}
            comments={details.comments}
            activity={details.activity}
            status={details.status}
            errorMessage={details.errorMessage}
            onRetry={details.reload}
            onAddComment={handleAddComment}
          />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={deletingTask !== undefined}
        title="Delete Task"
        message={`Delete "${deletingTask?.title ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </PageContainer>
  );
};

export default Tasks;
