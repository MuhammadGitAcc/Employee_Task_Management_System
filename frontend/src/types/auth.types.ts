export type Role = "Admin" | "Manager" | "Employee";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
