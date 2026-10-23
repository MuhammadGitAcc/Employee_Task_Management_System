import { rateLimit, type Options } from "express-rate-limit";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export const createRateLimiter = (options: Partial<Options>) =>
  rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new HttpError(429, "Too many attempts. Please try again later."));
    },
    ...options,
  });

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  skip: () => env.nodeEnv === "test",
});
