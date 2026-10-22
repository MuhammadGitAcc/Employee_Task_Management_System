import React, { useState } from "react";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import Textarea from "~/components/ui/Textarea";
import { ApiError } from "~/services/api";
import { getTodayISO } from "~/utils/helpers";
import { TASK_PRIORITIES, TASK_STATUSES } from "./task.types";
import type {
  AssigneeOption,
  TaskInput,
  TaskPriority,
  TaskStatus,
} from "./task.types";
import { validateTask } from "./task.validation";
import type { TaskFormErrors } from "./task.validation";

interface TaskFormProps {
  onSubmit: (task: TaskInput) => Promise<void>;
  assigneeOptions: AssigneeOption[];
  initialData?: TaskInput;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  assigneeOptions,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialData?.status || "To Do"
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialData?.priority || "Medium"
  );
  const [dueDate, setDueDate] = useState(initialData?.dueDate || getTodayISO());
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || "");
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof TaskFormErrors) => {
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateTask({ title, description, dueDate, assigneeId });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setFormError("");
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate,
        assigneeId,
      });
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors(error.details as TaskFormErrors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          clearError("title");
        }}
        error={errors.title}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          clearError("description");
        }}
        error={errors.description}
        rows={3}
      />
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
      >
        {TASK_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
      >
        {TASK_PRIORITIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => {
          setDueDate(e.target.value);
          clearError("dueDate");
        }}
        error={errors.dueDate}
        required
      />
      <Select
        label="Assigned To"
        value={assigneeId}
        onChange={(e) => {
          setAssigneeId(e.target.value);
          clearError("assigneeId");
        }}
        error={errors.assigneeId}
        required
      >
        <option value="">Select an employee</option>
        {assigneeOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Select>
      {assigneeOptions.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No employees yet. Add one on the Employees page first.
        </p>
      )}
      {formError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save Task"}
      </Button>
    </form>
  );
};

export default TaskForm;
