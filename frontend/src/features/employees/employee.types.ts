import type { Role } from "~/types/auth.types";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeInput = Omit<Employee, "id" | "createdAt" | "updatedAt">;

export type NewEmployeeInput = EmployeeInput & { password: string };
