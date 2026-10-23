import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getToken, setToken } from "~/services/api";
import AuthProvider from "./AuthProvider";
import { useAuth } from "./useAuth";

const employee = {
  id: "user-1",
  name: "Eli Employee",
  email: "employee@example.com",
  role: "Employee",
};

const mockFetch = (status: number, body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(body, { status }))
  );

const Probe = () => {
  const { user, login, register, logout } = useAuth();
  return (
    <div>
      <p>{user ? `${user.name} (${user.role})` : "signed out"}</p>
      <button onClick={() => void login("a@b.co", "pw").catch(() => {})}>
        login
      </button>
      <button
        onClick={() =>
          void register("Eli Employee", "a@b.co", "pw12345678").catch(() => {})
        }
      >
        register
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AuthProvider", () => {
  it("starts signed out", () => {
    renderProvider();

    expect(screen.getByText("signed out")).toBeInTheDocument();
  });

  it("logs in through the API and saves the token", async () => {
    mockFetch(200, { token: "tok", user: employee });
    renderProvider();

    await userEvent.click(screen.getByText("login"));

    expect(
      await screen.findByText("Eli Employee (Employee)")
    ).toBeInTheDocument();
    expect(getToken()).toBe("tok");
  });

  it("stays signed out when the login is rejected", async () => {
    mockFetch(401, { error: { message: "Invalid email or password" } });
    renderProvider();

    await userEvent.click(screen.getByText("login"));

    expect(screen.getByText("signed out")).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it("registers through the API, signs in and saves the token", async () => {
    mockFetch(201, { token: "tok", user: employee });
    renderProvider();

    await userEvent.click(screen.getByText("register"));

    expect(
      await screen.findByText("Eli Employee (Employee)")
    ).toBeInTheDocument();
    expect(getToken()).toBe("tok");
  });

  it("stays signed out when the sign-up is rejected", async () => {
    mockFetch(409, {
      error: { message: "Another employee already uses this email." },
    });
    renderProvider();

    await userEvent.click(screen.getByText("register"));

    expect(screen.getByText("signed out")).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it("logout clears the user and the token", async () => {
    mockFetch(200, { token: "tok", user: employee });
    renderProvider();
    await userEvent.click(screen.getByText("login"));
    await screen.findByText("Eli Employee (Employee)");

    await userEvent.click(screen.getByText("logout"));

    expect(screen.getByText("signed out")).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it("restores a saved session and refreshes it from the server", async () => {
    setToken("tok");
    localStorage.setItem("session", JSON.stringify(employee));
    mockFetch(200, { user: { ...employee, role: "Manager" } });
    renderProvider();

    expect(screen.getByText("Eli Employee (Employee)")).toBeInTheDocument();
    expect(
      await screen.findByText("Eli Employee (Manager)")
    ).toBeInTheDocument();
  });

  it("signs out when the server rejects the saved token", async () => {
    setToken("expired");
    localStorage.setItem("session", JSON.stringify(employee));
    mockFetch(401, { error: { message: "Invalid or expired token" } });
    renderProvider();

    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it("ignores a saved session that has no token", () => {
    localStorage.setItem("session", JSON.stringify(employee));
    renderProvider();

    expect(screen.getByText("signed out")).toBeInTheDocument();
  });
});
