import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "~/services/api";
import * as chatApi from "~/services/chat";
import { connectChatSocket } from "~/services/chatSocket";
import type { ChatSocketHandlers } from "~/services/chatSocket";
import type { ChatMessage } from "./chat.types";
import { useChat } from "./useChat";

vi.mock("~/services/chat");
vi.mock("~/services/chatSocket");

const makeMessage = (
  id: string,
  overrides: Partial<ChatMessage> = {}
): ChatMessage => ({
  id,
  channelId: "general",
  senderId: "user-admin",
  sender: "Alex Admin",
  text: `Text of ${id}`,
  createdAt: "2026-10-20T08:00:00.000Z",
  ...overrides,
});

const first = makeMessage("message-1");
const second = makeMessage("message-2", {
  createdAt: "2026-10-20T08:05:00.000Z",
});

let handlers: ChatSocketHandlers;
const stopSocket = vi.fn();

const renderLoaded = async () => {
  vi.mocked(chatApi.listMessages).mockResolvedValue([first]);
  const hook = renderHook(({ channel }) => useChat(channel), {
    initialProps: { channel: "general" },
  });
  await waitFor(() => expect(hook.result.current.status).toBe("ready"));
  return hook;
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(connectChatSocket).mockImplementation((given) => {
    handlers = given;
    return stopSocket;
  });
});

describe("useChat", () => {
  it("loads the messages of the channel", async () => {
    vi.mocked(chatApi.listMessages).mockResolvedValue([first]);
    const { result } = renderHook(() => useChat("general"));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(chatApi.listMessages).toHaveBeenCalledWith("general");
    expect(result.current.messages).toEqual([first]);
  });

  it("reports an error when the messages cannot be loaded", async () => {
    vi.mocked(chatApi.listMessages).mockRejectedValue(
      new ApiError(0, "Cannot reach the server.")
    );
    const { result } = renderHook(() => useChat("general"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBe("Cannot reach the server.");
  });

  it("loads again when reload is called", async () => {
    vi.mocked(chatApi.listMessages)
      .mockRejectedValueOnce(new ApiError(0, "Cannot reach the server."))
      .mockResolvedValueOnce([first]);
    const { result } = renderHook(() => useChat("general"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.messages).toEqual([first]);
  });

  it("adds a message pushed for this channel and ignores other channels", async () => {
    const { result } = await renderLoaded();
    act(() => {
      handlers.onMessage?.(makeMessage("message-9", { channelId: "tasks" }));
      handlers.onMessage?.(second);
    });
    expect(result.current.messages).toEqual([first, second]);
  });

  it("adds the message the server returns after sending", async () => {
    vi.mocked(chatApi.sendMessage).mockResolvedValue(second);
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.send("Hello");
    });
    expect(chatApi.sendMessage).toHaveBeenCalledWith("general", "Hello");
    expect(result.current.messages).toEqual([first, second]);
  });

  it("does not show a sent message twice when the socket repeats it", async () => {
    vi.mocked(chatApi.sendMessage).mockResolvedValue(second);
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.send("Hello");
    });
    act(() => {
      handlers.onMessage?.(second);
    });
    expect(result.current.messages).toEqual([first, second]);
  });

  it("keeps the messages unchanged when sending fails", async () => {
    const failure = new ApiError(0, "Cannot reach the server.");
    vi.mocked(chatApi.sendMessage).mockRejectedValue(failure);
    const { result } = await renderLoaded();
    await act(async () => {
      await expect(result.current.send("Hello")).rejects.toBe(failure);
    });
    expect(result.current.messages).toEqual([first]);
  });

  it("follows the connection and loads missed messages when it opens", async () => {
    const { result } = await renderLoaded();
    expect(result.current.connection).toBe("connecting");
    vi.mocked(chatApi.listMessages).mockResolvedValue([first, second]);
    act(() => {
      handlers.onStatus("open");
    });
    expect(result.current.connection).toBe("open");
    await waitFor(() =>
      expect(result.current.messages).toEqual([first, second])
    );
    expect(chatApi.listMessages).toHaveBeenCalledTimes(2);
    act(() => {
      handlers.onStatus("closed");
    });
    expect(result.current.connection).toBe("closed");
  });

  it("loads the new channel when it changes, without reconnecting", async () => {
    const taskMessage = makeMessage("message-5", { channelId: "tasks" });
    vi.mocked(chatApi.listMessages)
      .mockResolvedValueOnce([first])
      .mockResolvedValueOnce([taskMessage]);
    const { result, rerender } = renderHook(({ channel }) => useChat(channel), {
      initialProps: { channel: "general" },
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    rerender({ channel: "tasks" });
    await waitFor(() => expect(result.current.messages).toEqual([taskMessage]));
    expect(chatApi.listMessages).toHaveBeenLastCalledWith("tasks");
    expect(connectChatSocket).toHaveBeenCalledTimes(1);
  });

  it("stops the socket when it is no longer used", async () => {
    const { unmount } = await renderLoaded();
    unmount();
    expect(stopSocket).toHaveBeenCalledTimes(1);
  });
});
