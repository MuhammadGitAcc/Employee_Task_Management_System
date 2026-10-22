import { createContext } from "react";
import type { AuthUser } from "~/types/auth.types";
import type { Permission } from "./permissions";

export interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
