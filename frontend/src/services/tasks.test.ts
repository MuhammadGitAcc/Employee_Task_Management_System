import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task, TaskInput } from "~/features/tasks/task.types";
import { setToken } from "./api";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from "./tasks";

const task: Task = {
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
};

const input: TaskInput = {
  title: "Write report",
  description: "Quarterly summary",
  status: "To Do",
  priority: "Medium",
  dueDate: "2026-12-01",
  assigneeId: "user-admin",
};

const mockFetch = (status: number, body?: unknown) => {
  const fetchMock = vi.fn(async () =>
    status === 204
      ? new Response(null, { status })
      : Response.json(body, { status })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const lastCall = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls[0] as unknown as [string, RequestInit];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listTasks", () => {
  it("sends the saved token and returns the tasks", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, { tasks: [task] });

    await expect(listTasks()).resolves.toEqual([task]);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks$/);
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer abc"
    );
  });
});

describe("createTask", () => {
  it("posts the task and returns the created one", async () => {
    const fetchMock = mockFetch(201, { task });

    await expect(createTask(input)).resolves.toEqual(task);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(input);
  });
});

describe("updateTask", () => {
  it("puts the changes to the task id", async () => {
    const fetchMock = mockFetch(200, { task });

    await expect(updateTask("task-1", input)).resolves.toEqual(task);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks\/task-1$/);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual(input);
  });
});

describe("updateTaskStatus", () => {
  it("patches only the status", async () => {
    const fetchMock = mockFetch(200, { task: { ...task, status: "Done" } });

    await expect(updateTaskStatus("task-1", "Done")).resolves.toMatchObject({
      status: "Done",
    });

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks\/task-1\/status$/);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ status: "Done" });
  });
});

describe("deleteTask", () => {
  it("sends a DELETE for the task id", async () => {
    const fetchMock = mockFetch(204);

    await deleteTask("task-1");

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks\/task-1$/);
    expect(init.method).toBe("DELETE");
  });
});
