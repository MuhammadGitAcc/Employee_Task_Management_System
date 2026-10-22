import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { attachSocketServer } from "./realtime/socket.server.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

const socketServer = attachSocketServer(server);

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  socketServer.close();
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
