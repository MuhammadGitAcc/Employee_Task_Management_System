import { describe, expect, it } from "vitest";
import { validateChangePassword } from "./password.validation";

const valid = {
  currentPassword: "secret1234",
  newPassword: "newsecret5678",
  confirmPassword: "newsecret5678",
};

describe("validateChangePassword", () => {
  it("accepts valid values", () => {
    expect(validateChangePassword(valid)).toEqual({});
  });

  it("requires every field", () => {
    expect(
      validateChangePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    ).toEqual({
      currentPassword: "Current password is required.",
      newPassword: "New password is required.",
      confirmPassword: "Confirm your new password.",
    });
  });

  it("rejects a new password that is too short", () => {
    const result = validateChangePassword({
      ...valid,
      newPassword: "short",
      confirmPassword: "short",
    });

    expect(result.newPassword).toBe(
      "New password must be at least 8 characters."
    );
  });

  it("rejects a new password that is too long", () => {
    const long = "a".repeat(73);
    const result = validateChangePassword({
      ...valid,
      newPassword: long,
      confirmPassword: long,
    });

    expect(result.newPassword).toBe(
      "New password must be 72 characters or fewer."
    );
  });

  it("rejects a new password equal to the current one", () => {
    const result = validateChangePassword({
      ...valid,
      newPassword: valid.currentPassword,
      confirmPassword: valid.currentPassword,
    });

    expect(result.newPassword).toBe(
      "New password must be different from the current password."
    );
  });

  it("rejects a confirmation that does not match", () => {
    const result = validateChangePassword({
      ...valid,
      confirmPassword: "different123",
    });

    expect(result.confirmPassword).toBe("Passwords do not match.");
  });
});
