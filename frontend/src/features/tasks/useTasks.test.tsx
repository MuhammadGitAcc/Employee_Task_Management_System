import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "~/features/auth/auth.context";
import type { AuthContextValue } from "~/features/auth/auth.context";
import { ApiError } from "~/services/api";
import { connectChatSocket } from "~/services/chatSocket";
import type { ChatSocketHandlers } from "~/services/chatSocket";
import * as tasksApi from "~/services/tasks";
import type { Task, TaskInput } from "./task.types";
import TasksProvider from "./TasksProvider";
import { useTasks } from "./useTasks";

vi.mock("~/services/tasks");
vi.mock("~/services/chatSocket");

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Write report",
  description: "Quarterly summary",
  status: "To Do",
  priority: "Medium",
  dueDate: "2026-12-01",
  assigneeId: "user-admin",
  assignedTo: "Alex Admin",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...overrides,
});

const input: TaskInput = {
  title: "Write report",
  description: "Quarterly summary",
  status: "To Do",
  priority: "Medium",
  dueDate: "2026-12-01",
  assigneeId: "user-admin",
};

const loggedIn: AuthContextValue = {
  user: {
    id: "user-admin",
    name: "Alex Admin",
    email: "admin@example.com",
    role: "Admin",
  },
  login: async () => {},
  register: async () => {},
  logout: () => {},
  can: () => true,
};

const loggedOut: AuthContextValue = { ...loggedIn, user: null };

const createWrapper = (auth: AuthContextValue) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={auth}>
        <TasksProvider>{children}</TasksProvider>
      </AuthContext.Provider>
    );
  };

const renderLoaded = async (initial: Task[]) => {
  vi.mocked(tasksApi.listTasks).mockResolvedValue(initial);
  const hook = renderHook(() => useTasks(), {
    wrapper: createWrapper(loggedIn),
  });
  await waitFor(() => expect(hook.result.current.status).toBe("ready"));
  return hook;
};

let socketHandlers: ChatSocketHandlers;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(connectChatSocket).mockImplementation((handlers) => {
    socketHandlers = handlers;
    return () => {};
  });
});

describe("useTasks", () => {
  it("loads the tasks from the API", async () => {
    vi.mocked(tasksApi.listTasks).mockResolvedValue([makeTask()]);
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(loggedIn),
    });
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.tasks).toEqual([makeTask()]);
  });

  it("reports an error when the tasks cannot be loaded", async () => {
    vi.mocked(tasksApi.listTasks).mockRejectedValue(
      new ApiError(0, "Cannot reach the server.")
    );
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(loggedIn),
    });
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBe("Cannot reach the server.");
    expect(result.current.tasks).toEqual([]);
  });

  it("loads nothing while nobody is logged in", () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(loggedOut),
    });
    expect(tasksApi.listTasks).not.toHaveBeenCalled();
    expect(result.current.tasks).toEqual([]);
  });

  it("loads again when reload is called", async () => {
    vi.mocked(tasksApi.listTasks)
      .mockRejectedValueOnce(new ApiError(0, "Cannot reach the server."))
      .mockResolvedValueOnce([makeTask()]);
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(loggedIn),
    });
    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.tasks).toHaveLength(1);
  });

  it("adds the task the server returns", async () => {
    const created = makeTask({ id: "task-2", title: "New task" });
    vi.mocked(tasksApi.createTask).mockResolvedValue(created);
    const { result } = await renderLoaded([]);
    await act(async () => {
      await result.current.addTask(input);
    });
    expect(tasksApi.createTask).toHaveBeenCalledWith(input);
    expect(result.current.tasks).toEqual([created]);
  });

  it("keeps the list unchanged when adding fails", async () => {
    const failure = new ApiError(403, "Not allowed");
    vi.mocked(tasksApi.createTask).mockRejectedValue(failure);
    const { result } = await renderLoaded([]);
    await act(async () => {
      await expect(result.current.addTask(input)).rejects.toBe(failure);
    });
    expect(result.current.tasks).toEqual([]);
  });

  it("replaces a task with the one the server returns", async () => {
    const changed = makeTask({ title: "Changed title" });
    vi.mocked(tasksApi.updateTask).mockResolvedValue(changed);
    const { result } = await renderLoaded([makeTask()]);
    await act(async () => {
      await result.current.updateTask("task-1", input);
    });
    expect(tasksApi.updateTask).toHaveBeenCalledWith("task-1", input);
    expect(result.current.tasks).toEqual([changed]);
  });

  it("moves a task to another status", async () => {
    vi.mocked(tasksApi.updateTaskStatus).mockResolvedValue(
      makeTask({ status: "Done" })
    );
    const { result } = await renderLoaded([makeTask()]);
    await act(async () => {
      await result.current.moveTask("task-1", "Done");
    });
    expect(tasksApi.updateTaskStatus).toHaveBeenCalledWith("task-1", "Done");
    expect(result.current.tasks[0].status).toBe("Done");
  });

  it("deletes a task", async () => {
    vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined);
    const { result } = await renderLoaded([makeTask()]);
    await act(async () => {
      await result.current.deleteTask("task-1");
    });
    expect(tasksApi.deleteTask).toHaveBeenCalledWith("task-1");
    expect(result.current.tasks).toEqual([]);
  });

  it("refreshes the list without skeletons when the server reports a change", async () => {
    const { result } = await renderLoaded([makeTask()]);
    const changed = makeTask({ title: "Changed by someone else" });
    vi.mocked(tasksApi.listTasks).mockResolvedValue([changed]);

    act(() => {
      socketHandlers.onTasksChanged?.();
    });

    expect(result.current.status).toBe("ready");
    await waitFor(() => expect(result.current.tasks).toEqual([changed]));
  });

  it("loads the list again after the socket reconnects", async () => {
    const { result } = await renderLoaded([makeTask()]);
    const changed = makeTask({ title: "Changed while offline" });
    vi.mocked(tasksApi.listTasks).mockResolvedValue([changed]);

    act(() => {
      socketHandlers.onStatus("open");
    });
    expect(tasksApi.listTasks).toHaveBeenCalledTimes(1);

    act(() => {
      socketHandlers.onStatus("closed");
    });
    act(() => {
      socketHandlers.onStatus("open");
    });

    await waitFor(() => expect(result.current.tasks).toEqual([changed]));
    expect(tasksApi.listTasks).toHaveBeenCalledTimes(2);
  });

  it("keeps the current list when a refresh fails", async () => {
    const { result } = await renderLoaded([makeTask()]);
    vi.mocked(tasksApi.listTasks).mockRejectedValue(
      new ApiError(0, "Cannot reach the server.")
    );

    act(() => {
      socketHandlers.onTasksChanged?.();
    });

    await waitFor(() => expect(tasksApi.listTasks).toHaveBeenCalledTimes(2));
    expect(result.current.status).toBe("ready");
    expect(result.current.tasks).toEqual([makeTask()]);
  });

  it("stops the socket when the provider unmounts", async () => {
    const stop = vi.fn();
    vi.mocked(connectChatSocket).mockImplementation((handlers) => {
      socketHandlers = handlers;
      return stop;
    });
    const { unmount } = await renderLoaded([]);

    unmount();

    expect(stop).toHaveBeenCalled();
  });

  it("does not open the socket while nobody is logged in", () => {
    renderHook(() => useTasks(), { wrapper: createWrapper(loggedOut) });

    expect(connectChatSocket).not.toHaveBeenCalled();
  });
});
