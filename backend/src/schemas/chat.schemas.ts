import { z } from "zod";

export const CHAT_CHANNEL_IDS = ["general", "tasks", "announcements"] as const;

export const CHAT_MESSAGE_MAX_LENGTH = 500;

export const chatMessageInputSchema = z.object({
  text: z
    .string("Message cannot be empty.")
    .trim()
    .min(1, "Message cannot be empty.")
    .max(
      CHAT_MESSAGE_MAX_LENGTH,
      `Message must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer.`,
    ),
});

export type ChatMessageInput = z.infer<typeof chatMessageInputSchema>;
