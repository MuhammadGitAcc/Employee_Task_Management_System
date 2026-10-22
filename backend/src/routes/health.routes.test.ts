import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";

describe("health and app setup", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/health returns ok", async () => {
    const res = await api().get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/health/db returns connected when the query works", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await api().get("/api/health/db");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", database: "connected" });
  });

  it("GET /api/health/db returns 500 when the query fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));

    const res = await api().get("/api/health/db");

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe("db down");
  });

  it("returns a JSON 404 for an unknown route", async () => {
    const res = await api().get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Route not found: GET /api/nope");
  });

  it("allows an origin listed in CORS_ORIGIN", async () => {
    const res = await api()
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("does not allow an origin missing from CORS_ORIGIN", async () => {
    const res = await api()
      .get("/api/health")
      .set("Origin", "https://evil.example.com");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
