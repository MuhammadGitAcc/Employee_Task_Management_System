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

export interface UserRemovedEvent {
  type: "user-removed";
  userId: string;
}

export type HubEvent = BroadcastEvent | UserRemovedEvent;

export type SocketEvent = { type: "ready" } | BroadcastEvent;
