import { prisma } from "../lib/prisma.js";
import { publish } from "../realtime/chat.hub.js";
import { CHAT_CHANNEL_IDS } from "../schemas/chat.schemas.js";
import type { ChatMessageInput } from "../schemas/chat.schemas.js";
import type { AuthUser } from "../types/auth.types.js";
import type { ApiChatMessage } from "../types/chat.types.js";
import { HttpError } from "../utils/httpError.js";

const MESSAGE_LIMIT = 200;

interface MessageRow {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

const assertChannelExists = (channelId: string): void => {
  if (!(CHAT_CHANNEL_IDS as readonly string[]).includes(channelId)) {
    throw new HttpError(404, "Channel not found");
  }
};

const toApiMessage = (row: MessageRow, sender: string): ApiChatMessage => ({
  id: row.id,
  channelId: row.channelId,
  senderId: row.senderId,
  sender,
  text: row.text,
  createdAt: row.createdAt.toISOString(),
});

export const listMessages = async (
  channelId: string,
): Promise<ApiChatMessage[]> => {
  assertChannelExists(channelId);

  const rows = await prisma.chatMessage.findMany({
    where: { channelId },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: MESSAGE_LIMIT,
  });

  return rows.reverse().map((row) => toApiMessage(row, row.sender.name));
};

export const addMessage = async (
  channelId: string,
  input: ChatMessageInput,
  sender: AuthUser,
): Promise<ApiChatMessage> => {
  assertChannelExists(channelId);

  const row = await prisma.chatMessage.create({
    data: { channelId, senderId: sender.id, text: input.text },
  });
  const message = toApiMessage(row, sender.name);

  publish({ type: "message", message });

  return message;
};
