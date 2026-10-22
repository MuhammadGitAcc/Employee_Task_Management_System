import type { ChatMessage } from "./chat.types";

export const MAX_MESSAGES = 500;

// Combines two lists without duplicates (the same message can arrive from
// the send request, the socket and a reload), oldest first
export const mergeMessages = (
  current: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] => {
  const byId = new Map<string, ChatMessage>();
  current.forEach((message) => byId.set(message.id, message));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-MAX_MESSAGES);
};
