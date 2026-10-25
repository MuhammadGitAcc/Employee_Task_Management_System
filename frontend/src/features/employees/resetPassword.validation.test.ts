import { describe, expect, it } from "vitest";
import { validateResetPassword } from "./resetPassword.validation";

describe("validateResetPassword", () => {
  it("accepts a valid password that matches its confirmation", () => {
    expect(
      validateResetPassword({
        newPassword: "newsecret5678",
        confirmPassword: "newsecret5678",
      })
    ).toEqual({});
  });

  it("requires both fields", () => {
    expect(
      validateResetPassword({ newPassword: "", confirmPassword: "" })
    ).toEqual({
      newPassword: "New password is required.",
      confirmPassword: "Confirm the new password.",
    });
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      validateResetPassword({ newPassword: "short", confirmPassword: "short" })
        .newPassword
    ).toBe("New password must be at least 8 characters.");
  });

  it("rejects a password longer than 72 characters", () => {
    const long = "a".repeat(73);

    expect(
      validateResetPassword({ newPassword: long, confirmPassword: long })
        .newPassword
    ).toBe("New password must be 72 characters or fewer.");
  });

  it("rejects a confirmation that does not match", () => {
    expect(
      validateResetPassword({
        newPassword: "newsecret5678",
        confirmPassword: "different123",
      }).confirmPassword
    ).toBe("Passwords do not match.");
  });
});
