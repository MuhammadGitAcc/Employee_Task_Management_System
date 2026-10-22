import { z } from "zod";

export const COMMENT_MAX_LENGTH = 500;

export const commentInputSchema = z.object({
  text: z
    .string("Comment cannot be empty.")
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(
      COMMENT_MAX_LENGTH,
      `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`,
    ),
});

export type CommentInput = z.infer<typeof commentInputSchema>;
