import type { AuthUser, Role } from "~/types/auth.types";
import { api } from "./api";

interface LoginResult {
  token: string;
  user: AuthUser;
}

interface DemoLogin {
  email: string;
  password: string;
  role: Role;
}

// The demo accounts created by the backend seed (npm run db:seed)
export const DEMO_LOGINS: DemoLogin[] = [
  { email: "admin@example.com", password: "admin123", role: "Admin" },
  { email: "manager@example.com", password: "manager123", role: "Manager" },
  { email: "employee@example.com", password: "employee123", role: "Employee" },
];

export const login = (email: string, password: string): Promise<LoginResult> =>
  api.post<LoginResult>(
    "/auth/login",
    { email: email.trim(), password },
    { auth: false }
  );

export const register = (
  name: string,
  email: string,
  password: string
): Promise<LoginResult> =>
  api.post<LoginResult>(
    "/auth/register",
    { name: name.trim(), email: email.trim(), password },
    { auth: false }
  );

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const { user } = await api.get<{ user: AuthUser }>("/auth/me");
  return user;
};
