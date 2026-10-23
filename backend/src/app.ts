import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { tasksRouter } from "./routes/tasks.routes.js";
import { usersRouter } from "./routes/users.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || env.corsOrigins.includes(origin));
      },
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/tasks", tasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
