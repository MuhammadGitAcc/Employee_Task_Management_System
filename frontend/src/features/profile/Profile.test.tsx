import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "~/features/tasks/task.types";
import Profile from "./Profile";

const mocks = vi.hoisted(() => ({ useTasks: vi.fn() }));

vi.mock("~/features/auth/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "user-alex",
      name: "Alex Admin",
      email: "alex@example.com",
      role: "Admin",
    },
  }),
}));
vi.mock("~/features/tasks/useTasks", () => ({ useTasks: mocks.useTasks }));
vi.mock("./ChangePasswordForm", () => ({ default: () => null }));

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Task",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "2099-01-01",
  assigneeId: "user-alex",
  assignedTo: "Alex Admin",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...overrides,
});

const tasksState = (overrides: Record<string, unknown> = {}) => ({
  tasks: [] as Task[],
  status: "ready",
  errorMessage: "",
  reload: vi.fn(),
  ...overrides,
});

describe("Profile", () => {
  it("shows a loading placeholder instead of task counts while loading", () => {
    mocks.useTasks.mockReturnValue(tasksState({ status: "loading" }));
    render(<Profile />);
    expect(
      screen.getByRole("status", { name: "Loading task counts" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Tasks Assigned:")).not.toBeInTheDocument();
  });

  it("shows the error and a Try again button when loading fails", async () => {
    const reload = vi.fn();
    mocks.useTasks.mockReturnValue(
      tasksState({
        status: "error",
        errorMessage: "Cannot reach the server.",
        reload,
      })
    );
    render(<Profile />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Cannot reach the server."
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("counts the tasks assigned to the user and the completed ones", () => {
    mocks.useTasks.mockReturnValue(
      tasksState({
        tasks: [
          makeTask({ id: "1", status: "Done" }),
          makeTask({ id: "2" }),
          makeTask({ id: "3", assigneeId: "user-other", assignedTo: "Other" }),
        ],
      })
    );
    render(<Profile />);
    expect(screen.getByText("Tasks Assigned:")).toHaveTextContent(
      "Tasks Assigned: 2"
    );
    expect(screen.getByText("Tasks Completed:")).toHaveTextContent(
      "Tasks Completed: 1"
    );
  });
});
