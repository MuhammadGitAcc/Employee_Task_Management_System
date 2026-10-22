import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  TaskActivity,
  TaskComment,
} from "~/features/tasks/task.collab.types";
import { setToken } from "./api";
import { addComment, listActivity, listComments } from "./comments";

const comment: TaskComment = {
  id: "comment-1",
  taskId: "task-1",
  authorId: "user-admin",
  author: "Alex Admin",
  text: "Looks good",
  createdAt: "2026-10-20T08:00:00.000Z",
};

const entry: TaskActivity = {
  id: "activity-1",
  taskId: "task-1",
  actorId: "user-admin",
  actor: "Alex Admin",
  message: "created this task",
  createdAt: "2026-10-20T07:00:00.000Z",
};

const mockFetch = (status: number, body: unknown) => {
  const fetchMock = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const lastCall = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls[0] as unknown as [string, RequestInit];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listComments", () => {
  it("sends the saved token and returns the comments", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, { comments: [comment] });

    await expect(listComments("task-1")).resolves.toEqual([comment]);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks\/task-1\/comments$/);
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer abc"
    );
  });
});

describe("addComment", () => {
  it("posts the text and returns the new comment", async () => {
    const fetchMock = mockFetch(201, { comment });

    await expect(addComment("task-1", "Looks good")).resolves.toEqual(comment);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks\/task-1\/comments$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ text: "Looks good" });
  });
});

describe("listActivity", () => {
  it("returns the activity of the task", async () => {
    const fetchMock = mockFetch(200, { activity: [entry] });

    await expect(listActivity("task-1")).resolves.toEqual([entry]);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/tasks\/task-1\/activity$/);
    expect(init.method).toBe("GET");
  });
});
