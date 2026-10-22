import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext } from "./auth.context";
import type { AuthContextValue } from "./auth.context";
import ProtectedRoute from "./ProtectedRoute";

const loggedOut: AuthContextValue = {
  user: null,
  login: async () => {},
  logout: () => {},
  can: () => false,
};

const loggedIn: AuthContextValue = {
  ...loggedOut,
  user: {
    id: "user-admin",
    name: "Alex Admin",
    email: "admin@example.com",
    role: "Admin",
  },
};

const LoginStub = () => {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "";
  return <p>Login page, from: {from}</p>;
};

const renderAt = (value: AuthContextValue) =>
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/tasks"]}>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <p>Secret tasks</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("ProtectedRoute", () => {
  it("sends a logged-out visitor to the login page and remembers the page", () => {
    renderAt(loggedOut);
    expect(screen.getByText("Login page, from: /tasks")).toBeInTheDocument();
    expect(screen.queryByText("Secret tasks")).not.toBeInTheDocument();
  });

  it("shows the page to a logged-in user", () => {
    renderAt(loggedIn);
    expect(screen.getByText("Secret tasks")).toBeInTheDocument();
    expect(screen.queryByText(/Login page/)).not.toBeInTheDocument();
  });
});
