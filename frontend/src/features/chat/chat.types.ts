export interface ChatChannel {
  id: string;
  name: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  sender: string;
  text: string;
  createdAt: string;
}
