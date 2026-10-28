import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "../utils/httpError.js";
import { errorHandler } from "./error.middleware.js";

vi.mock("../config/env.js", () => ({ env: { isProduction: true } }));

const RAW_DATABASE_ERROR =
  "Invalid `prisma.user.findUnique()` invocation: connect ETIMEDOUT 3.14.0.1:5432";

describe("error handler in production", () => {
  it("hides the text of an unexpected error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = express();

    app.get("/boom", () => {
      throw new Error(RAW_DATABASE_ERROR);
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe("Internal server error");
    expect(res.text).not.toContain("prisma");
    expect(res.text).not.toContain("ETIMEDOUT");
  });

  it("still shows the message of an expected error", async () => {
    const app = express();

    app.get("/missing", () => {
      throw new HttpError(404, "Employee not found");
    });
    app.use(errorHandler);

    const res = await request(app).get("/missing");

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Employee not found");
  });
});
