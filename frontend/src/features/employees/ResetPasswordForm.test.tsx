import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "~/services/api";
import ResetPasswordForm from "./ResetPasswordForm";

const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  render(<ResetPasswordForm employeeName="Sam Employee" onSubmit={onSubmit} />);
  return onSubmit;
};

const fillForm = async (next: string, confirm: string) => {
  await userEvent.type(screen.getByLabelText("New password"), next);
  await userEvent.type(screen.getByLabelText("Confirm new password"), confirm);
};

const submit = () =>
  userEvent.click(screen.getByRole("button", { name: "Set new password" }));

describe("ResetPasswordForm", () => {
  it("shows a message for each empty field and sends nothing", async () => {
    const onSubmit = renderForm();

    await submit();

    expect(screen.getByText("New password is required.")).toBeInTheDocument();
    expect(screen.getByText("Confirm the new password.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an error when the confirmation does not match", async () => {
    const onSubmit = renderForm();
    await fillForm("newsecret5678", "different123");

    await submit();

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends the new password when the form is valid", async () => {
    const onSubmit = renderForm();
    await fillForm("newsecret5678", "newsecret5678");

    await submit();

    expect(onSubmit).toHaveBeenCalledWith("newsecret5678");
  });

  it("shows the server message when saving fails", async () => {
    const onSubmit = renderForm(
      vi.fn().mockRejectedValue(new ApiError(404, "Employee not found"))
    );
    await fillForm("newsecret5678", "newsecret5678");

    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Employee not found"
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
