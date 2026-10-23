import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ApiError } from "~/services/api";
import { AuthContext } from "./auth.context";
import type { AuthContextValue } from "./auth.context";
import SignUpPage from "./SignUpPage";

const renderPage = (register = vi.fn().mockResolvedValue(undefined)) => {
  const value: AuthContextValue = {
    user: null,
    login: vi.fn(),
    register,
    logout: vi.fn(),
    can: () => false,
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  return register;
};

const fillForm = async () => {
  await userEvent.type(screen.getByLabelText("Name"), "Eli Employee");
  await userEvent.type(screen.getByLabelText("Email"), "employee@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "secret1234");
};

describe("SignUpPage", () => {
  it("shows a message for each empty field and sends nothing", async () => {
    const register = renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("sends the name, email and password", async () => {
    const register = renderPage();
    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(register).toHaveBeenCalledWith(
      "Eli Employee",
      "employee@example.com",
      "secret1234"
    );
  });

  it("shows the server message under the email field", async () => {
    const message = "Another employee already uses this email.";
    renderPage(
      vi.fn().mockRejectedValue(new ApiError(409, message, { email: message }))
    );
    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
