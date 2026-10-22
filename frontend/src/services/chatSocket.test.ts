import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "~/features/chat/chat.types";
import { setToken } from "./api";
import { connectChatSocket, getSocketUrl } from "./chatSocket";

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = 0;
  sent: string[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
    this.onclose?.({ code: 1000 });
  }

  open() {
    this.readyState = 1;
    this.onopen?.();
  }

  receive(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }

  receiveRaw(data: unknown) {
    this.onmessage?.({ data });
  }

  drop(code = 1006) {
    this.readyState = 3;
    this.onclose?.({ code });
  }
}

const message: ChatMessage = {
  id: "message-1",
  channelId: "general",
  senderId: "user-admin",
  sender: "Alex Admin",
  text: "Hello team",
  createdAt: "2026-10-20T08:00:00.000Z",
};

const latest = () =>
  FakeWebSocket.instances[FakeWebSocket.instances.length - 1];

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("getSocketUrl", () => {
  it("uses ws for a local http API and drops the API path", () => {
    expect(
      getSocketUrl("http://localhost:4000/api", "http://localhost:5173/")
    ).toBe("ws://localhost:4000/ws");
  });

  it("uses wss for an https API", () => {
    expect(
      getSocketUrl("https://api.example.com/api", "https://app.example.com/")
    ).toBe("wss://api.example.com/ws");
  });

  it("follows the page address when the API path is relative", () => {
    expect(getSocketUrl("/api", "https://app.example.com/chat")).toBe(
      "wss://app.example.com/ws"
    );
  });
});

describe("connectChatSocket", () => {
  it("sends the saved token once connected and reports open when ready", () => {
    setToken("abc");
    const onStatus = vi.fn();
    connectChatSocket({ onMessage: vi.fn(), onStatus });

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(latest().url).toMatch(/^wss?:\/\/.+\/ws$/);
    expect(onStatus).toHaveBeenLastCalledWith("connecting");

    latest().open();
    expect(latest().sent).toEqual([
      JSON.stringify({ type: "auth", token: "abc" }),
    ]);
    expect(onStatus).toHaveBeenLastCalledWith("connecting");

    latest().receive({ type: "ready" });
    expect(onStatus).toHaveBeenLastCalledWith("open");
  });

  it("passes messages on and ignores anything it cannot read", () => {
    setToken("abc");
    const onMessage = vi.fn();
    connectChatSocket({ onMessage, onStatus: vi.fn() });
    latest().open();

    latest().receive({ type: "message", message });
    latest().receiveRaw("not json");
    latest().receiveRaw(42);
    latest().receive({ type: "message", message: { id: "message-2" } });
    latest().receive({ type: "other" });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it("tells the caller when the tasks changed", () => {
    setToken("abc");
    const onTasksChanged = vi.fn();
    const onMessage = vi.fn();
    connectChatSocket({ onMessage, onTasksChanged, onStatus: vi.fn() });
    latest().open();

    latest().receive({ type: "tasks-changed" });

    expect(onTasksChanged).toHaveBeenCalledTimes(1);
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("ignores events it has no handler for", () => {
    setToken("abc");
    connectChatSocket({ onStatus: vi.fn() });
    latest().open();

    expect(() => {
      latest().receive({ type: "message", message });
      latest().receive({ type: "tasks-changed" });
    }).not.toThrow();
  });

  it("reconnects with a growing delay after the connection drops", () => {
    setToken("abc");
    const onStatus = vi.fn();
    connectChatSocket({ onMessage: vi.fn(), onStatus });

    latest().drop();
    expect(onStatus).toHaveBeenLastCalledWith("closed");
    vi.advanceTimersByTime(999);
    expect(FakeWebSocket.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(onStatus).toHaveBeenLastCalledWith("connecting");

    latest().drop();
    vi.advanceTimersByTime(1999);
    expect(FakeWebSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });

  it("starts the delay over once the connection is ready again", () => {
    setToken("abc");
    const onStatus = vi.fn();
    connectChatSocket({ onMessage: vi.fn(), onStatus });

    latest().drop();
    vi.advanceTimersByTime(1000);
    latest().drop();
    vi.advanceTimersByTime(2000);
    latest().open();
    latest().receive({ type: "ready" });
    expect(onStatus).toHaveBeenLastCalledWith("open");

    latest().drop();
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(4);
  });

  it("does not retry when the server rejects the token", () => {
    setToken("abc");
    const onStatus = vi.fn();
    connectChatSocket({ onMessage: vi.fn(), onStatus });

    latest().drop(4401);
    vi.advanceTimersByTime(60000);

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(onStatus).toHaveBeenLastCalledWith("closed");
  });

  it("does not connect without a saved token", () => {
    const onStatus = vi.fn();
    connectChatSocket({ onMessage: vi.fn(), onStatus });

    expect(FakeWebSocket.instances).toHaveLength(0);
    expect(onStatus).toHaveBeenCalledWith("closed");
  });

  it("closes the socket and cancels a pending retry when stopped", () => {
    setToken("abc");
    const onStatus = vi.fn();
    const stop = connectChatSocket({ onMessage: vi.fn(), onStatus });
    latest().open();

    stop();
    expect(latest().readyState).toBe(3);

    const second = connectChatSocket({ onMessage: vi.fn(), onStatus });
    latest().drop();
    second();
    vi.advanceTimersByTime(60000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  it("closes a socket that is stopped before it finished connecting", () => {
    setToken("abc");
    const stop = connectChatSocket({
      onMessage: vi.fn(),
      onStatus: vi.fn(),
    });
    const socket = latest();

    stop();
    socket.open();

    expect(socket.sent).toEqual([]);
    expect(socket.readyState).toBe(3);
  });
});
