import { afterEach, describe, expect, it, vi } from "vitest";
import { removeEmployee, resetPassword } from "./employees";

const mockFetch = (status: number, body?: unknown) => {
  const fetchMock = vi.fn(async () =>
    status === 204
      ? new Response(null, { status })
      : Response.json(body, { status })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const lastCall = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls[0] as unknown as [string, RequestInit];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("removeEmployee", () => {
  it("sends a DELETE for the employee id", async () => {
    const fetchMock = mockFetch(204);

    await removeEmployee("user-2");

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/users\/user-2$/);
    expect(init.method).toBe("DELETE");
  });

  it("throws the server message when the removal is refused", async () => {
    mockFetch(404, { error: { message: "Employee not found" } });

    await expect(removeEmployee("missing")).rejects.toThrow(
      "Employee not found"
    );
  });
});

describe("resetPassword", () => {
  it("puts the new password to the employee's password address", async () => {
    const fetchMock = mockFetch(204);

    await resetPassword("user-2", "newsecret5678");

    const [url, init] = lastCall(fetchMock);
    expect(url).toMatch(/\/users\/user-2\/password$/);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({
      newPassword: "newsecret5678",
    });
  });
});
