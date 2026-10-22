import { afterEach, describe, expect, it, vi } from "vitest";
import { setToken } from "./api";
import { fetchCurrentUser, login } from "./auth";

const user = {
  id: "user-1",
  name: "Eli Employee",
  email: "employee@example.com",
  role: "Employee",
};

const mockFetch = (status: number, body: unknown) => {
  const fetchMock = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login", () => {
  it("posts the trimmed email and the password, then returns the result", async () => {
    const fetchMock = mockFetch(200, { token: "abc", user });

    const result = await login("  employee@example.com ", "employee123");

    expect(result).toEqual({ token: "abc", user });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toMatch(/\/auth\/login$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "employee@example.com",
      password: "employee123",
    });
  });

  it("rejects with the server message for a wrong password", async () => {
    mockFetch(401, { error: { message: "Invalid email or password" } });

    await expect(login("employee@example.com", "wrong")).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });
});

describe("fetchCurrentUser", () => {
  it("sends the saved token and returns the user", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, { user });

    await expect(fetchCurrentUser()).resolves.toEqual(user);

    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer abc"
    );
  });
});
