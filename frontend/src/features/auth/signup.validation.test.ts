import { describe, expect, it } from "vitest";
import { validateSignUp } from "./signup.validation";

const valid = {
  name: "Eli Employee",
  email: "employee@example.com",
  password: "secret1234",
};

describe("validateSignUp", () => {
  it("accepts valid values", () => {
    expect(validateSignUp(valid)).toEqual({});
  });

  it("requires every field", () => {
    expect(validateSignUp({ name: "  ", email: "", password: "" })).toEqual({
      name: "Name is required.",
      email: "Email is required.",
      password: "Password is required.",
    });
  });

  it("rejects a name that is too short", () => {
    expect(validateSignUp({ ...valid, name: "A" }).name).toBe(
      "Name must be at least 2 characters."
    );
  });

  it("rejects an invalid email", () => {
    expect(validateSignUp({ ...valid, email: "not-an-email" }).email).toBe(
      "Enter a valid email address."
    );
  });

  it("rejects a password that is too short", () => {
    expect(validateSignUp({ ...valid, password: "short" }).password).toBe(
      "Password must be at least 8 characters."
    );
  });

  it("rejects a password that is too long", () => {
    expect(
      validateSignUp({ ...valid, password: "a".repeat(73) }).password
    ).toBe("Password must be 72 characters or fewer.");
  });
});
