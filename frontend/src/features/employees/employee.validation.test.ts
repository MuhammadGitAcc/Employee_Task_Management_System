import { describe, expect, it } from "vitest";
import type { NewEmployeeInput } from "./employee.types";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateEmployee,
} from "./employee.validation";

const valid: NewEmployeeInput = {
  name: "Eli Employee",
  email: "eli@example.com",
  role: "Employee",
  jobTitle: "Support Agent",
  department: "Support",
  password: "",
};

describe("validateEmployee", () => {
  it("returns no errors when the password is not required", () => {
    expect(validateEmployee(valid, [])).toEqual({});
  });

  it("requires a name", () => {
    expect(validateEmployee({ ...valid, name: "  " }, []).name).toBe(
      "Name is required."
    );
  });

  it("rejects an email that another employee already uses", () => {
    expect(validateEmployee(valid, ["ELI@example.com"]).email).toBe(
      "Another employee already uses this email."
    );
  });

  it("requires a password when asked to", () => {
    expect(validateEmployee(valid, [], true).password).toBe(
      "Password is required."
    );
  });

  it("rejects a password that is too short", () => {
    const password = "a".repeat(PASSWORD_MIN_LENGTH - 1);
    expect(validateEmployee({ ...valid, password }, [], true).password).toBe(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
    );
  });

  it("rejects a password that is too long", () => {
    const password = "a".repeat(PASSWORD_MAX_LENGTH + 1);
    expect(validateEmployee({ ...valid, password }, [], true).password).toBe(
      `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`
    );
  });

  it("accepts a valid password", () => {
    expect(
      validateEmployee({ ...valid, password: "secret123" }, [], true)
    ).toEqual({});
  });
});
