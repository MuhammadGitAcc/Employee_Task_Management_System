import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "~/services/api";
import { getTodayISO } from "~/utils/helpers";
import TaskForm from "./TaskForm";
import type { AssigneeOption, TaskInput } from "./task.types";

const assigneeOptions: AssigneeOption[] = [
  { id: "user-alex", name: "Alex Admin" },
  { id: "user-morgan", name: "Morgan Manager" },
];

const renderForm = (initialData?: TaskInput, options = assigneeOptions) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <TaskForm
      onSubmit={onSubmit}
      assigneeOptions={options}
      initialData={initialData}
    />
  );
  return { onSubmit };
};

describe("TaskForm", () => {
  it("shows errors and does not submit when required fields are empty", async () => {
    const { onSubmit } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Save Task" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Assigned to is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values when the form is valid", async () => {
    const { onSubmit } = renderForm();
    await userEvent.type(screen.getByLabelText("Title"), "  Write report  ");
    await userEvent.selectOptions(
      screen.getByLabelText("Assigned To"),
      "Alex Admin"
    );
    await userEvent.click(screen.getByRole("button", { name: "Save Task" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Write report",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: getTodayISO(),
      assigneeId: "user-alex",
    });
  });

  it("clears the title error as soon as the user types", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Save Task" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Title"), "a");
    expect(screen.queryByText("Title is required.")).not.toBeInTheDocument();
  });

  it("requires a due date", async () => {
    const { onSubmit } = renderForm();
    await userEvent.type(screen.getByLabelText("Title"), "Write report");
    await userEvent.selectOptions(
      screen.getByLabelText("Assigned To"),
      "Alex Admin"
    );
    fireEvent.change(screen.getByLabelText("Due Date"), {
      target: { value: "" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save Task" }));
    expect(screen.getByText("Due date is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("fills the fields from initialData when editing", () => {
    renderForm({
      title: "Existing task",
      description: "Existing description",
      status: "In Progress",
      priority: "High",
      dueDate: "2026-12-01",
      assigneeId: "user-morgan",
    });
    expect(screen.getByLabelText("Title")).toHaveValue("Existing task");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Existing description"
    );
    expect(screen.getByLabelText("Status")).toHaveValue("In Progress");
    expect(screen.getByLabelText("Priority")).toHaveValue("High");
    expect(screen.getByLabelText("Due Date")).toHaveValue("2026-12-01");
    expect(screen.getByLabelText("Assigned To")).toHaveValue("user-morgan");
  });

  it("shows the error from the server when saving fails", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(0, "Cannot reach the server."));
    render(<TaskForm onSubmit={onSubmit} assigneeOptions={assigneeOptions} />);
    await userEvent.type(screen.getByLabelText("Title"), "Write report");
    await userEvent.selectOptions(
      screen.getByLabelText("Assigned To"),
      "Alex Admin"
    );
    await userEvent.click(screen.getByRole("button", { name: "Save Task" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot reach the server."
    );
  });

  it("tells the user to add employees first when there are none", () => {
    renderForm(undefined, []);
    expect(
      screen.getByText("No employees yet. Add one on the Employees page first.")
    ).toBeInTheDocument();
  });
});
