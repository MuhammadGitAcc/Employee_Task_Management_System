import { afterEach, describe, expect, it, vi } from "vitest";
import { setToken } from "./api";
import { changePassword, fetchCurrentUser, login, register } from "./auth";

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

describe("register", () => {
  it("posts the trimmed name and email with the password", async () => {
    const fetchMock = mockFetch(201, { token: "abc", user });

    const result = await register(
      "  Eli Employee ",
      "  employee@example.com ",
      "secret1234"
    );

    expect(result).toEqual({ token: "abc", user });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toMatch(/\/auth\/register$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Eli Employee",
      email: "employee@example.com",
      password: "secret1234",
    });
  });

  it("rejects with the field details when the email is used", async () => {
    const message = "Another employee already uses this email.";
    mockFetch(409, { error: { message, details: { email: message } } });

    await expect(
      register("Eli Employee", "employee@example.com", "secret1234")
    ).rejects.toMatchObject({ status: 409, details: { email: message } });
  });
});

describe("changePassword", () => {
  it("puts the current and the new password", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await changePassword("secret1234", "newsecret5678");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toMatch(/\/auth\/password$/);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({
      currentPassword: "secret1234",
      newPassword: "newsecret5678",
    });
  });

  it("rejects with the field details when the current password is wrong", async () => {
    const message = "Current password is incorrect.";
    mockFetch(400, {
      error: { message, details: { currentPassword: message } },
    });

    await expect(
      changePassword("wrong-password", "newsecret5678")
    ).rejects.toMatchObject({
      status: 400,
      details: { currentPassword: message },
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
