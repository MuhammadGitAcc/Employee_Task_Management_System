import type { z } from "zod";
import { HttpError } from "./httpError.js";

export const parseOrThrow = <T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.output<T> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  const details: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "body";
    details[field] ??= issue.message;
  }

  throw new HttpError(400, "Validation failed", details);
};
