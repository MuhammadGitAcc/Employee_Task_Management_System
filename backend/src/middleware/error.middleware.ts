import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

function getStatus(err: unknown): number {
  if (err instanceof HttpError) {
    return err.status;
  }
  if (typeof err === "object" && err !== null && "status" in err) {
    const { status } = err as { status: unknown };
    if (typeof status === "number" && status >= 400 && status < 600) {
      return status;
    }
  }
  return 500;
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = getStatus(err);

  if (status === 500) {
    console.error(err);
  }

  const message =
    status === 500 && env.isProduction
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";

  const details = err instanceof HttpError ? err.details : undefined;

  res.status(status).json({ error: { message, ...(details && { details }) } });
};
