import type { ChatMessage } from "~/features/chat/chat.types";
import { env } from "~/utils/env";
import { getToken } from "./api";

export type SocketStatus = "connecting" | "open" | "closed";

export interface ChatSocketHandlers {
  onMessage?: (message: ChatMessage) => void;
  onTasksChanged?: () => void;
  onStatus: (status: SocketStatus) => void;
}

type ServerEvent =
  | { type: "ready" }
  | { type: "tasks-changed" }
  | { type: "message"; message: ChatMessage };

// The free server can take up to a minute to wake up, so retries slow down
// but never stop
const RETRY_DELAYS_MS = [1000, 2000, 5000, 10000, 15000];
const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_FORBIDDEN_ORIGIN = 4403;

export const getSocketUrl = (
  apiUrl: string = env.apiUrl,
  base: string = window.location.href
): string => {
  const url = new URL(apiUrl, base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
};

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return ["id", "channelId", "senderId", "sender", "text", "createdAt"].every(
    (key) => typeof record[key] === "string"
  );
};

const parseEvent = (raw: unknown): ServerEvent | null => {
  if (typeof raw !== "string") return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const event = data as { type?: unknown; message?: unknown };
  if (event.type === "ready") return { type: "ready" };
  if (event.type === "tasks-changed") return { type: "tasks-changed" };
  if (event.type === "message" && isChatMessage(event.message)) {
    return { type: "message", message: event.message };
  }
  return null;
};

// Opens the chat socket and keeps it open. Returns a function that stops it.
export const connectChatSocket = (
  handlers: ChatSocketHandlers
): (() => void) => {
  let socket: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;
  let stopped = false;

  const open = () => {
    const token = getToken();
    if (!token) {
      handlers.onStatus("closed");
      return;
    }

    handlers.onStatus("connecting");
    const current = new WebSocket(getSocketUrl());
    socket = current;

    current.onopen = () => {
      current.send(JSON.stringify({ type: "auth", token }));
    };

    current.onmessage = (event: MessageEvent) => {
      const parsed = parseEvent(event.data);
      if (!parsed) return;
      if (parsed.type === "ready") {
        attempt = 0;
        handlers.onStatus("open");
        return;
      }
      if (parsed.type === "tasks-changed") {
        handlers.onTasksChanged?.();
        return;
      }
      handlers.onMessage?.(parsed.message);
    };

    current.onclose = (event: CloseEvent) => {
      if (stopped) return;
      socket = null;
      handlers.onStatus("closed");
      if (
        event.code === CLOSE_UNAUTHORIZED ||
        event.code === CLOSE_FORBIDDEN_ORIGIN
      ) {
        return;
      }
      const delay =
        RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
      attempt += 1;
      retryTimer = setTimeout(open, delay);
    };
  };

  open();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    const current = socket;
    socket = null;
    if (!current) return;
    current.onmessage = null;
    if (current.readyState === WebSocket.CONNECTING) {
      current.onopen = () => current.close();
    } else {
      current.close();
    }
  };
};
