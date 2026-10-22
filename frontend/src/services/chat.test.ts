import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "~/features/chat/chat.types";
import { setToken } from "./api";
import { listMessages, sendMessage } from "./chat";

const message: ChatMessage = {
  id: "message-1",
  channelId: "general",
  senderId: "user-admin",
  sender: "Alex Admin",
  text: "Hello team",
  createdAt: "2026-10-20T08:00:00.000Z",
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

describe("listMessages", () => {
  it("sends the saved token and returns the messages", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, { messages: [message] });

    await expect(listMessages("general")).resolves.toEqual([message]);

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/chat\/general\/messages$/);
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer abc"
    );
  });
});

describe("sendMessage", () => {
  it("posts the text and returns the saved message", async () => {
    const fetchMock = mockFetch(201, { message });

    await expect(sendMessage("general", "Hello team")).resolves.toEqual(
      message
    );

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/chat\/general\/messages$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ text: "Hello team" });
  });
});
