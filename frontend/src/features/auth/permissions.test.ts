import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions";
import type { Permission } from "./permissions";

const ALL_PERMISSIONS: Permission[] = [
  "task:create",
  "task:edit",
  "task:delete",
  "employee:manage",
];

describe("hasPermission", () => {
  it("gives an Admin every permission", () => {
    ALL_PERMISSIONS.forEach((permission) => {
      expect(hasPermission("Admin", permission)).toBe(true);
    });
  });

  it("lets a Manager create and edit tasks but not delete or manage employees", () => {
    expect(hasPermission("Manager", "task:create")).toBe(true);
    expect(hasPermission("Manager", "task:edit")).toBe(true);
    expect(hasPermission("Manager", "task:delete")).toBe(false);
    expect(hasPermission("Manager", "employee:manage")).toBe(false);
  });

  it("gives an Employee no permissions", () => {
    ALL_PERMISSIONS.forEach((permission) => {
      expect(hasPermission("Employee", permission)).toBe(false);
    });
  });
});
