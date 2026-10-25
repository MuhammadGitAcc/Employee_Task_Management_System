import type {
  Employee,
  EmployeeInput,
  NewEmployeeInput,
} from "~/features/employees/employee.types";
import { api } from "./api";

export const listEmployees = async (): Promise<Employee[]> => {
  const { users } = await api.get<{ users: Employee[] }>("/users");
  return users;
};

export const createEmployee = async (
  input: NewEmployeeInput
): Promise<Employee> => {
  const { user } = await api.post<{ user: Employee }>("/users", input);
  return user;
};

export const updateEmployee = async (
  id: string,
  input: EmployeeInput
): Promise<Employee> => {
  const { user } = await api.put<{ user: Employee }>(`/users/${id}`, input);
  return user;
};

export const removeEmployee = (id: string): Promise<void> =>
  api.delete(`/users/${id}`);

export const resetPassword = (id: string, newPassword: string): Promise<void> =>
  api.put<void>(`/users/${id}/password`, { newPassword });
