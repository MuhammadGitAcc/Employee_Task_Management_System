import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "~/services/api";
import { changePassword } from "~/services/auth";
import ChangePasswordForm from "./ChangePasswordForm";

vi.mock("~/services/auth", () => ({ changePassword: vi.fn() }));

const fillForm = async (current: string, next: string, confirm: string) => {
  await userEvent.type(screen.getByLabelText("Current password"), current);
  await userEvent.type(screen.getByLabelText("New password"), next);
  await userEvent.type(screen.getByLabelText("Confirm new password"), confirm);
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Change password" }));

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.mocked(changePassword).mockReset();
  });

  it("shows a message for each empty field and sends nothing", async () => {
    render(<ChangePasswordForm />);

    await submit();

    expect(
      screen.getByText("Current password is required.")
    ).toBeInTheDocument();
    expect(screen.getByText("New password is required.")).toBeInTheDocument();
    expect(screen.getByText("Confirm your new password.")).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("shows an error when the confirmation does not match", async () => {
    render(<ChangePasswordForm />);
    await fillForm("secret1234", "newsecret5678", "different123");

    await submit();

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("saves the new password, confirms it and clears the fields", async () => {
    vi.mocked(changePassword).mockResolvedValue(undefined);
    render(<ChangePasswordForm />);
    await fillForm("secret1234", "newsecret5678", "newsecret5678");

    await submit();

    expect(await screen.findByText("Password changed.")).toBeInTheDocument();
    expect(changePassword).toHaveBeenCalledWith("secret1234", "newsecret5678");
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    expect(screen.getByLabelText("New password")).toHaveValue("");
  });

  it("shows the server message under the current password field", async () => {
    const message = "Current password is incorrect.";
    vi.mocked(changePassword).mockRejectedValue(
      new ApiError(400, message, { currentPassword: message })
    );
    render(<ChangePasswordForm />);
    await fillForm("wrong-password", "newsecret5678", "newsecret5678");

    await submit();

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
