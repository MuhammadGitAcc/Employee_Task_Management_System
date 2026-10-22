export interface ApiChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  sender: string;
  text: string;
  createdAt: string;
}

export interface ChatEvent {
  type: "message";
  message: ApiChatMessage;
}

export interface TasksChangedEvent {
  type: "tasks-changed";
}

export type BroadcastEvent = ChatEvent | TasksChangedEvent;

export type SocketEvent = { type: "ready" } | BroadcastEvent;
