import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  api,
  getToken,
  hasSlowRequests,
  setToken,
  setUnauthorizedHandler,
} from "./api";

const mockFetch = (status: number, body: unknown) => {
  const fetchMock = vi.fn(async () =>
    status === 204
      ? new Response(null, { status })
      : Response.json(body, { status })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const lastRequest = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls[0] as unknown as [string, RequestInit];

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe("api client", () => {
  it("saves and clears the token", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it("sends the token and a JSON body, and returns the parsed response", async () => {
    setToken("abc");
    const fetchMock = mockFetch(201, { task: { id: "t1" } });

    const result = await api.post("/tasks", { title: "Report" });

    expect(result).toEqual({ task: { id: "t1" } });
    const [url, init] = lastRequest(fetchMock);
    expect(url).toMatch(/\/tasks$/);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "Report" }));
    expect(init.headers).toMatchObject({
      Authorization: "Bearer abc",
      "Content-Type": "application/json",
    });
  });

  it("does not send the token when auth is false", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, {});

    await api.post("/auth/login", {}, { auth: false });

    const [, init] = lastRequest(fetchMock);
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("returns nothing for a 204 response", async () => {
    mockFetch(204, null);

    await expect(api.delete("/tasks/t1")).resolves.toBeNull();
  });

  it("throws an ApiError with status, message and details", async () => {
    mockFetch(400, {
      error: {
        message: "Validation failed",
        details: { title: "Title is required." },
      },
    });

    const error = await api.post("/tasks", {}).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      message: "Validation failed",
      details: { title: "Title is required." },
    });
  });

  it("throws an ApiError with status 0 when the server cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    );

    await expect(api.get("/tasks")).rejects.toMatchObject({ status: 0 });
  });

  it("calls the unauthorized handler when a saved token is rejected", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    setToken("expired");
    mockFetch(401, { error: { message: "Invalid or expired token" } });

    await expect(api.get("/tasks")).rejects.toMatchObject({ status: 401 });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call the unauthorized handler when there is no token", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { error: { message: "Invalid email or password" } });

    await expect(
      api.post("/auth/login", {}, { auth: false })
    ).rejects.toMatchObject({ status: 401 });

    expect(handler).not.toHaveBeenCalled();
  });

  it("flags a slow request until it finishes", async () => {
    vi.useFakeTimers();
    let finish: (response: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          })
      )
    );

    const pending = api.get("/tasks");
    expect(hasSlowRequests()).toBe(false);

    await vi.advanceTimersByTimeAsync(3000);
    expect(hasSlowRequests()).toBe(true);

    finish(Response.json({ tasks: [] }));
    await pending;
    expect(hasSlowRequests()).toBe(false);
  });
});
