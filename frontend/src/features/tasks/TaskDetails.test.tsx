import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskDetails from "./TaskDetails";

const renderDetails = (assignedTo: string) =>
  render(
    <TaskDetails
      assignedTo={assignedTo}
      comments={[]}
      activity={[]}
      status="ready"
      errorMessage=""
      onRetry={vi.fn()}
      onAddComment={vi.fn().mockResolvedValue(undefined)}
    />
  );

describe("TaskDetails", () => {
  it("shows the name of the assignee", () => {
    renderDetails("Alex Admin");
    expect(screen.getByText("Assigned to: Alex Admin")).toBeInTheDocument();
  });

  it("shows Unassigned when the task has no assignee", () => {
    renderDetails("");
    expect(screen.getByText("Assigned to: Unassigned")).toBeInTheDocument();
  });
});
