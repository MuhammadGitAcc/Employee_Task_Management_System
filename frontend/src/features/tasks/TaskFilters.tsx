import React from "react";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { TASK_PRIORITIES, TASK_STATUSES } from "./task.types";
import type { TaskPriority, TaskStatus } from "./task.types";
import { UNASSIGNED_FILTER, UNASSIGNED_LABEL } from "./task.assignee";
import { DEFAULT_FILTERS } from "./task.filters";
import type { SortOrder, TaskFilterState } from "./task.filters";

interface TaskFiltersProps {
  filters: TaskFilterState;
  assignees: string[];
  hasUnassigned?: boolean;
  onChange: (filters: TaskFilterState) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  assignees,
  hasUnassigned = false,
  onChange,
}) => {
  const assigneeOptions =
    filters.assignee === "All" ||
    filters.assignee === UNASSIGNED_FILTER ||
    assignees.includes(filters.assignee)
      ? assignees
      : [...assignees, filters.assignee];

  return (
    <Card className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <Input
          label="Search"
          type="search"
          placeholder="Search title or description"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <Select
        label="Status"
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as TaskStatus | "All" })
        }
      >
        <option value="All">All</option>
        {TASK_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Select
        label="Priority"
        value={filters.priority}
        onChange={(e) =>
          onChange({
            ...filters,
            priority: e.target.value as TaskPriority | "All",
          })
        }
      >
        <option value="All">All</option>
        {TASK_PRIORITIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Select
        label="Assigned To"
        value={filters.assignee}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
      >
        <option value="All">All</option>
        {(hasUnassigned || filters.assignee === UNASSIGNED_FILTER) && (
          <option value={UNASSIGNED_FILTER}>{UNASSIGNED_LABEL}</option>
        )}
        {assigneeOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Select
        label="Sort by due date"
        value={filters.sort}
        onChange={(e) =>
          onChange({ ...filters, sort: e.target.value as SortOrder })
        }
      >
        <option value="asc">Earliest first</option>
        <option value="desc">Latest first</option>
      </Select>
      <div className="sm:col-span-2 flex justify-end">
        <Button variant="secondary" onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset filters
        </Button>
      </div>
    </Card>
  );
};

export default TaskFilters;
