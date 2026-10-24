import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import WebSocket from "ws";
import { adminUser, mockUsers } from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";
import type { ApiChatMessage } from "../types/chat.types.js";
import { signToken } from "../utils/jwt.js";
import { publish } from "./chat.hub.js";
import {
  attachSocketServer,
  CLOSE_FORBIDDEN_ORIGIN,
  CLOSE_UNAUTHORIZED,
  SOCKET_PATH,
} from "./socket.server.js";

const message: ApiChatMessage = {
  id: "message-1",
  channelId: "general",
  senderId: adminUser.id,
  sender: adminUser.name,
  text: "Hello team",
  createdAt: "2026-10-20T08:00:00.000Z",
};

const sockets: WebSocket[] = [];
const closers: Array<() => Promise<void>> = [];

afterEach(async () => {
  sockets.splice(0).forEach((socket) => socket.terminate());

  for (const closeServer of closers.splice(0)) {
    await closeServer();
  }
});

const start = async (): Promise<string> => {
  const server = createServer();
  const socketServer = attachSocketServer(server);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;

  closers.push(async () => {
    socketServer.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  return `ws://127.0.0.1:${port}${SOCKET_PATH}`;
};

const connect = (url: string, options?: WebSocket.ClientOptions) => {
  const socket = new WebSocket(url, options);
  sockets.push(socket);
  return socket;
};

const opened = (socket: WebSocket) =>
  new Promise<void>((resolve, reject) => {
    socket.once("open", () => resolve());
    socket.once("error", reject);
  });

const nextMessage = (socket: WebSocket) =>
  new Promise<unknown>((resolve) => {
    socket.once("message", (data) => resolve(JSON.parse(data.toString())));
  });

const closedWith = (socket: WebSocket) =>
  new Promise<number>((resolve) => {
    socket.once("close", (code) => resolve(code));
  });

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const authenticate = async (socket: WebSocket, token?: string) => {
  const ready = nextMessage(socket);
  socket.send(
    JSON.stringify({
      type: "auth",
      token: token ?? (await signToken(adminUser)),
    }),
  );
  return ready;
};

describe("socket server", () => {
  it("answers ready after a valid token and then pushes new messages", async () => {
    mockUsers(adminUser);
    const socket = connect(await start());
    await opened(socket);

    await expect(authenticate(socket)).resolves.toEqual({ type: "ready" });

    const pushed = nextMessage(socket);
    publish({ type: "message", message });

    await expect(pushed).resolves.toEqual({ type: "message", message });
  });

  it("pushes tasks-changed to an authenticated socket", async () => {
    mockUsers(adminUser);
    const socket = connect(await start());
    await opened(socket);
    await authenticate(socket);

    const pushed = nextMessage(socket);
    publish({ type: "tasks-changed" });

    await expect(pushed).resolves.toEqual({ type: "tasks-changed" });
  });

  it("closes the socket when the token is invalid", async () => {
    mockUsers(adminUser);
    const socket = connect(await start());
    await opened(socket);

    const code = closedWith(socket);
    socket.send(JSON.stringify({ type: "auth", token: "not-a-token" }));

    await expect(code).resolves.toBe(CLOSE_UNAUTHORIZED);
  });

  it("closes the socket when the user no longer exists", async () => {
    mockUsers();
    const socket = connect(await start());
    await opened(socket);

    const code = closedWith(socket);
    socket.send(
      JSON.stringify({ type: "auth", token: await signToken(adminUser) }),
    );

    await expect(code).resolves.toBe(CLOSE_UNAUTHORIZED);
  });

  it("closes the socket when the user is deactivated", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...adminUser,
      active: false,
    });
    const socket = connect(await start());
    await opened(socket);

    const code = closedWith(socket);
    socket.send(
      JSON.stringify({ type: "auth", token: await signToken(adminUser) }),
    );

    await expect(code).resolves.toBe(CLOSE_UNAUTHORIZED);
  });

  it("sends nothing to a socket that has not authenticated", async () => {
    mockUsers(adminUser);
    const url = await start();
    const anonymous = connect(url);
    await opened(anonymous);
    const received: string[] = [];
    anonymous.on("message", (data) => received.push(data.toString()));

    const member = connect(url);
    await opened(member);
    await authenticate(member);

    const pushed = nextMessage(member);
    publish({ type: "message", message });
    await pushed;
    await wait(50);

    expect(received).toEqual([]);
  });

  it("rejects a connection from an origin that is not allowed", async () => {
    const socket = connect(await start(), { origin: "http://evil.example" });

    await expect(closedWith(socket)).resolves.toBe(CLOSE_FORBIDDEN_ORIGIN);
  });
});
