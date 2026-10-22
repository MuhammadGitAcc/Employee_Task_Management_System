import { describe, expect, it } from "vitest";
import { MAX_MESSAGES, mergeMessages } from "./chat.messages";
import type { ChatMessage } from "./chat.types";

const BASE_TIME = Date.UTC(2026, 9, 20, 8, 0, 0);

const makeMessage = (
  index: number,
  overrides: Partial<ChatMessage> = {}
): ChatMessage => ({
  id: `message-${index}`,
  channelId: "general",
  senderId: "user-admin",
  sender: "Alex Admin",
  text: `Message ${index}`,
  createdAt: new Date(BASE_TIME + index * 1000).toISOString(),
  ...overrides,
});

describe("mergeMessages", () => {
  it("puts the messages in order, oldest first", () => {
    const merged = mergeMessages(
      [makeMessage(2)],
      [makeMessage(3), makeMessage(1)]
    );

    expect(merged.map((message) => message.id)).toEqual([
      "message-1",
      "message-2",
      "message-3",
    ]);
  });

  it("does not duplicate a message that is already there", () => {
    const merged = mergeMessages(
      [makeMessage(1), makeMessage(2)],
      [makeMessage(2)]
    );

    expect(merged).toHaveLength(2);
  });

  it("keeps the incoming version of a repeated message", () => {
    const merged = mergeMessages(
      [makeMessage(1)],
      [makeMessage(1, { text: "Edited" })]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].text).toBe("Edited");
  });

  it("keeps only the newest messages when there are too many", () => {
    const many = Array.from({ length: MAX_MESSAGES + 1 }, (_, index) =>
      makeMessage(index)
    );

    const merged = mergeMessages([], many);

    expect(merged).toHaveLength(MAX_MESSAGES);
    expect(merged[0].id).toBe("message-1");
  });
});
