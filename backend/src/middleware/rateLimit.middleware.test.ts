import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "./error.middleware.js";
import { createRateLimiter } from "./rateLimit.middleware.js";

describe("rate limiter", () => {
  it("answers 429 after the limit is reached", async () => {
    const app = express();

    app.get(
      "/ping",
      createRateLimiter({ limit: 2, windowMs: 60_000 }),
      (_req, res) => {
        res.json({ ok: true });
      },
    );
    app.use(errorHandler);

    await request(app).get("/ping").expect(200);
    await request(app).get("/ping").expect(200);
    const res = await request(app).get("/ping");

    expect(res.status).toBe(429);
    expect(res.body.error.message).toBe(
      "Too many attempts. Please try again later.",
    );
  });
});
