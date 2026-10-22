import request from "supertest";
import { createApp } from "../app.js";
import type { AuthUser } from "../types/auth.types.js";
import { signToken } from "../utils/jwt.js";
import { prismaMock } from "./prismaMock.js";

export const adminUser: AuthUser = {
  id: "user-admin",
  name: "Ada Admin",
  email: "admin@example.com",
  role: "Admin",
};

export const managerUser: AuthUser = {
  id: "user-manager",
  name: "Max Manager",
  email: "manager@example.com",
  role: "Manager",
};

export const employeeUser: AuthUser = {
  id: "user-employee",
  name: "Eli Employee",
  email: "employee@example.com",
  role: "Employee",
};

export const api = () => request(createApp());

export const mockUsers = (...users: AuthUser[]): void => {
  prismaMock.user.findUnique.mockImplementation(
    async ({ where }: { where: { id?: string; email?: string } }) =>
      users.find(
        (user) => user.id === where.id || user.email === where.email,
      ) ?? null,
  );
};

export const bearer = async (user: AuthUser): Promise<string> =>
  `Bearer ${await signToken(user)}`;

export const taskRow = (overrides: Record<string, unknown> = {}) => ({
  id: "task-1",
  title: "Prepare report",
  description: "",
  status: "ToDo",
  priority: "Medium",
  dueDate: new Date("2026-12-01T00:00:00.000Z"),
  assigneeId: employeeUser.id,
  assignee: { name: employeeUser.name },
  createdAt: new Date("2026-10-18T05:00:00.000Z"),
  updatedAt: new Date("2026-10-18T05:00:00.000Z"),
  ...overrides,
});

export const validTaskBody = {
  title: "Prepare report",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "2026-12-01",
  assigneeId: employeeUser.id,
};
