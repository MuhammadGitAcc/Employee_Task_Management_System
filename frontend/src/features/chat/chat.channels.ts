import type { ChatChannel } from "./chat.types";

export const CHAT_CHANNELS: ChatChannel[] = [
  { id: "general", name: "General", description: "Team-wide conversation" },
  { id: "tasks", name: "Tasks", description: "Questions and updates on tasks" },
  {
    id: "announcements",
    name: "Announcements",
    description: "News and reminders",
  },
];

export const DEFAULT_CHANNEL_ID = CHAT_CHANNELS[0].id;
