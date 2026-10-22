import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "~/services/api";
import * as commentsApi from "~/services/comments";
import type { TaskActivity, TaskComment } from "./task.collab.types";
import { useTaskDetails } from "./useTaskDetails";

vi.mock("~/services/comments");

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

const renderLoaded = async () => {
  vi.mocked(commentsApi.listComments).mockResolvedValue([comment]);
  vi.mocked(commentsApi.listActivity).mockResolvedValue([entry]);
  const hook = renderHook(() => useTaskDetails("task-1"));
  await waitFor(() => expect(hook.result.current.status).toBe("ready"));
  return hook;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useTaskDetails", () => {
  it("loads the comments and the activity of the task", async () => {
    vi.mocked(commentsApi.listComments).mockResolvedValue([comment]);
    vi.mocked(commentsApi.listActivity).mockResolvedValue([entry]);
    const { result } = renderHook(() => useTaskDetails("task-1"));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(commentsApi.listComments).toHaveBeenCalledWith("task-1");
    expect(commentsApi.listActivity).toHaveBeenCalledWith("task-1");
    expect(result.current.comments).toEqual([comment]);
    expect(result.current.activity).toEqual([entry]);
  });

  it("loads nothing while no task is selected", () => {
    const { result } = renderHook(() => useTaskDetails(null));
    expect(commentsApi.listComments).not.toHaveBeenCalled();
    expect(commentsApi.listActivity).not.toHaveBeenCalled();
    expect(result.current.comments).toEqual([]);
    expect(result.current.activity).toEqual([]);
  });

  it("reports an error when the details cannot be loaded", async () => {
    vi.mocked(commentsApi.listComments).mockRejectedValue(
      new ApiError(0, "Cannot reach the server.")
    );
    vi.mocked(commentsApi.listActivity).mockResolvedValue([entry]);
    const { result } = renderHook(() => useTaskDetails("task-1"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBe("Cannot reach the server.");
  });

  it("loads again when reload is called", async () => {
    vi.mocked(commentsApi.listComments)
      .mockRejectedValueOnce(new ApiError(0, "Cannot reach the server."))
      .mockResolvedValueOnce([comment]);
    vi.mocked(commentsApi.listActivity).mockResolvedValue([entry]);
    const { result } = renderHook(() => useTaskDetails("task-1"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.comments).toEqual([comment]);
  });

  it("adds the comment the server returns", async () => {
    const created: TaskComment = { ...comment, id: "comment-2", text: "Done" };
    vi.mocked(commentsApi.addComment).mockResolvedValue(created);
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.addComment("Done");
    });
    expect(commentsApi.addComment).toHaveBeenCalledWith("task-1", "Done");
    expect(result.current.comments).toEqual([comment, created]);
  });

  it("keeps the comments unchanged when adding fails", async () => {
    const failure = new ApiError(0, "Cannot reach the server.");
    vi.mocked(commentsApi.addComment).mockRejectedValue(failure);
    const { result } = await renderLoaded();
    await act(async () => {
      await expect(result.current.addComment("Done")).rejects.toBe(failure);
    });
    expect(result.current.comments).toEqual([comment]);
  });
});
