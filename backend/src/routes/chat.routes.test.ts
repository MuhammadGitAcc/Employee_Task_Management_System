import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { subscribe } from "../realtime/chat.hub.js";
import { api, bearer, employeeUser, mockUsers } from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";
import type { ChatEvent } from "../types/chat.types.js";

const messageRow = (overrides: Record<string, unknown> = {}) => ({
  id: "message-1",
  channelId: "general",
  senderId: employeeUser.id,
  text: "Hello team",
  createdAt: new Date("2026-10-20T08:00:00.000Z"),
  sender: { name: employeeUser.name },
  ...overrides,
});

let events: ChatEvent[] = [];
let unsubscribe: () => void = () => undefined;

beforeEach(() => {
  events = [];
  unsubscribe = subscribe((event) => events.push(event));
});

afterEach(() => {
  unsubscribe();
});

describe("GET /api/chat/:channelId/messages", () => {
  it("requires a token", async () => {
    const res = await api().get("/api/chat/general/messages");

    expect(res.status).toBe(401);
  });

  it("returns the messages of the channel, oldest first", async () => {
    mockUsers(employeeUser);
    prismaMock.chatMessage.findMany.mockResolvedValue([
      messageRow({
        id: "message-2",
        text: "Second",
        createdAt: new Date("2026-10-20T08:05:00.000Z"),
      }),
      messageRow(),
    ]);

    const res = await api()
      .get("/api/chat/general/messages")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(200);
    expect(res.body.messages.map((m: { id: string }) => m.id)).toEqual([
      "message-1",
      "message-2",
    ]);
    expect(res.body.messages[0]).toEqual({
      id: "message-1",
      channelId: "general",
      senderId: employeeUser.id,
      sender: employeeUser.name,
      text: "Hello team",
      createdAt: "2026-10-20T08:00:00.000Z",
    });
    expect(prismaMock.chatMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { channelId: "general" }, take: 200 }),
    );
  });

  it("returns 404 for an unknown channel", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .get("/api/chat/random/messages")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(404);
    expect(prismaMock.chatMessage.findMany).not.toHaveBeenCalled();
  });
});

describe("POST /api/chat/:channelId/messages", () => {
  it("saves the trimmed message, returns it and publishes it", async () => {
    mockUsers(employeeUser);
    prismaMock.chatMessage.create.mockResolvedValue(messageRow());

    const res = await api()
      .post("/api/chat/general/messages")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "  Hello team  " });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: {
        id: "message-1",
        channelId: "general",
        senderId: employeeUser.id,
        sender: employeeUser.name,
        text: "Hello team",
        createdAt: "2026-10-20T08:00:00.000Z",
      },
    });
    expect(prismaMock.chatMessage.create).toHaveBeenCalledWith({
      data: {
        channelId: "general",
        senderId: employeeUser.id,
        text: "Hello team",
      },
    });
    expect(events).toEqual([{ type: "message", message: res.body.message }]);
  });

  it("rejects an empty message", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/chat/general/messages")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error.details.text).toBe("Message cannot be empty.");
    expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it("rejects a message longer than 500 characters", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/chat/general/messages")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "a".repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.error.details.text).toBe(
      "Message must be 500 characters or fewer.",
    );
    expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown channel", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/chat/random/messages")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "Hello" });

    expect(res.status).toBe(404);
    expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });
});
