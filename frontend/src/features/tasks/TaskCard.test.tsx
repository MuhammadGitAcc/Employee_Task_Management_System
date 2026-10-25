import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskCard from "./TaskCard";
import type { Task } from "./task.types";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Write report",
  description: "Quarterly numbers",
  status: "To Do",
  priority: "Medium",
  dueDate: "2099-01-01",
  assigneeId: "user-alex",
  assignedTo: "Alex Admin",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...overrides,
});

describe("TaskCard", () => {
  it("shows the name of the assignee", () => {
    render(<TaskCard {...makeTask()} />);
    expect(screen.getByText("Assigned to: Alex Admin")).toBeInTheDocument();
  });

  it("shows Unassigned when the task has no assignee", () => {
    render(<TaskCard {...makeTask({ assigneeId: null, assignedTo: "" })} />);
    expect(screen.getByText("Assigned to: Unassigned")).toBeInTheDocument();
  });
});
