import type { AuthUser } from "~/types/auth.types";
import { api } from "./api";

interface LoginResult {
  token: string;
  user: AuthUser;
}

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

export const changePassword = (
  currentPassword: string,
  newPassword: string
): Promise<void> =>
  api.put<void>("/auth/password", { currentPassword, newPassword });

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const { user } = await api.get<{ user: AuthUser }>("/auth/me");
  return user;
};
