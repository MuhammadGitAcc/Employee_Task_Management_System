import type { Server } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { SocketEvent } from "../types/chat.types.js";
import { verifyToken } from "../utils/jwt.js";
import { subscribe } from "./chat.hub.js";

export const SOCKET_PATH = "/ws";
export const CLOSE_UNAUTHORIZED = 4401;
export const CLOSE_FORBIDDEN_ORIGIN = 4403;

const CLOSE_GOING_AWAY = 1001;
const CLOSE_SERVER_ERROR = 1011;
const AUTH_TIMEOUT_MS = 5_000;
const PING_INTERVAL_MS = 30_000;
const MAX_PAYLOAD_BYTES = 4_096;

const send = (socket: WebSocket, event: SocketEvent): void => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(event));
  }
};

const readAuthToken = (data: WebSocket.RawData): string | null => {
  try {
    const message: unknown = JSON.parse(data.toString());

    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      message.type === "auth" &&
      "token" in message &&
      typeof message.token === "string"
    ) {
      return message.token;
    }

    return null;
  } catch {
    return null;
  }
};

const isKnownUser = async (token: string): Promise<boolean> => {
  const userId = await verifyToken(token);

  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return Boolean(user);
};

export const attachSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    path: SOCKET_PATH,
    maxPayload: MAX_PAYLOAD_BYTES,
  });
  const authenticated = new Set<WebSocket>();
  const alive = new WeakSet<WebSocket>();

  wss.on("connection", (socket, request) => {
    const origin = request.headers.origin;

    if (origin && !env.corsOrigins.includes(origin)) {
      socket.close(CLOSE_FORBIDDEN_ORIGIN, "Origin not allowed");
      return;
    }

    alive.add(socket);
    socket.on("pong", () => alive.add(socket));
    socket.on("error", () => socket.terminate());

    const authTimer = setTimeout(() => {
      socket.close(CLOSE_UNAUTHORIZED, "Authentication timeout");
    }, AUTH_TIMEOUT_MS);

    socket.on("close", () => {
      clearTimeout(authTimer);
      authenticated.delete(socket);
    });

    const authenticate = async (data: WebSocket.RawData): Promise<void> => {
      const token = readAuthToken(data);
      let valid = false;

      try {
        valid = token !== null && (await isKnownUser(token));
      } catch {
        socket.close(CLOSE_SERVER_ERROR, "Server error");
        return;
      }

      if (!valid) {
        socket.close(CLOSE_UNAUTHORIZED, "Unauthorized");
        return;
      }

      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }

      authenticated.add(socket);
      send(socket, { type: "ready" });
    };

    let handshakeStarted = false;

    socket.on("message", (data) => {
      if (handshakeStarted) {
        return;
      }

      handshakeStarted = true;
      clearTimeout(authTimer);
      void authenticate(data);
    });
  });

  const unsubscribe = subscribe((event) => {
    authenticated.forEach((socket) => send(socket, event));
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
      if (!alive.has(client)) {
        client.terminate();
        return;
      }

      alive.delete(client);
      client.ping();
    });
  }, PING_INTERVAL_MS);
  heartbeat.unref();

  const close = (): void => {
    clearInterval(heartbeat);
    unsubscribe();
    wss.clients.forEach((client) =>
      client.close(CLOSE_GOING_AWAY, "Server shutting down"),
    );
    wss.close();
  };

  return { close };
};
