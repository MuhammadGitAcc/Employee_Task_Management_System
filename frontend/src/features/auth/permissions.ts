import type { Role } from "~/types/auth.types";

export type Permission =
  "task:create" | "task:edit" | "task:delete" | "employee:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: ["task:create", "task:edit", "task:delete", "employee:manage"],
  Manager: ["task:create", "task:edit"],
  Employee: [],
};

export const hasPermission = (role: Role, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role].includes(permission);
