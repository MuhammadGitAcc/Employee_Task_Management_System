import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getToken, setToken, setUnauthorizedHandler } from "~/services/api";
import {
  fetchCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "~/services/auth";
import { storage } from "~/services/storage";
import type { AuthUser, Role } from "~/types/auth.types";
import { AuthContext } from "./auth.context";
import { hasPermission } from "./permissions";
import type { Permission } from "./permissions";

interface AuthProviderProps {
  children: React.ReactNode;
}

const SESSION_KEY = "session";
const ROLES: Role[] = ["Admin", "Manager", "Employee"];

const loadSession = (): AuthUser | null => {
  if (!getToken()) return null;
  const stored = storage.get<Partial<AuthUser> | null>(SESSION_KEY, null);
  if (!stored || typeof stored !== "object") return null;
  const { id, name, email, role } = stored;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    !role ||
    !ROLES.includes(role)
  ) {
    return null;
  }
  return { id, name, email, role };
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const logout = useCallback(() => {
    setToken(null);
    storage.set(SESSION_KEY, null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await loginRequest(email, password);
      setToken(result.token);
      storage.set(SESSION_KEY, result.user);
      setUser(result.user);
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      const result = await registerRequest(name, email, password);
      setToken(result.token);
      storage.set(SESSION_KEY, result.user);
      setUser(result.user);
    },
    []
  );

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    fetchCurrentUser()
      .then((fresh) => {
        if (cancelled) return;
        storage.set(SESSION_KEY, fresh);
        setUser(fresh);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const can = useCallback(
    (permission: Permission): boolean =>
      user !== null && hasPermission(user.role, permission),
    [user]
  );

  const value = useMemo(
    () => ({ user, login, register, logout, can }),
    [user, login, register, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
