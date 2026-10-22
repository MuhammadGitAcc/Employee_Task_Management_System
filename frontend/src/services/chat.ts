import type { ChatMessage } from "~/features/chat/chat.types";
import { api } from "./api";

export const listMessages = async (
  channelId: string
): Promise<ChatMessage[]> => {
  const { messages } = await api.get<{ messages: ChatMessage[] }>(
    `/chat/${channelId}/messages`
  );
  return messages;
};

export const sendMessage = async (
  channelId: string,
  text: string
): Promise<ChatMessage> => {
  const { message } = await api.post<{ message: ChatMessage }>(
    `/chat/${channelId}/messages`,
    { text }
  );
  return message;
};
