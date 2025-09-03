import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { jwtDecode } from "jwt-decode";

type Role = "ADMIN" | "OWNER" | "TENANT";
type Decoded = { sub: string; roles?: unknown; exp?: number; [k: string]: any };

type User = {
  id?: number;
  usernameOrEmail: string;
  roles: Role[];
};

type AuthCtx = {
  user: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const Ctx = createContext<AuthCtx>(null!);

// Accept only proper JWTs
const isJwt = (t: unknown): t is string =>
  typeof t === "string" && /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(t);

// Normalize roles => ADMIN | OWNER | TENANT (no-op if already correct)
function normalizeRoles(input?: unknown): Role[] {
  if (!Array.isArray(input)) return [];
  return input
    .map(String)
    .map(r => r.toUpperCase())
    .map(r => (r.startsWith("ROLE_") ? r.slice(5) : r))
    .filter((r): r is Role => r === "ADMIN" || r === "OWNER" || r === "TENANT");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Bootstrap from existing token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isJwt(token)) {
      localStorage.removeItem("token");
      return;
    }
    try {
      const d = jwtDecode<Decoded>(token);
      if (d.exp && d.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return;
      }
      setUser({
        usernameOrEmail: String(d.sub),
        roles: normalizeRoles(d.roles),
      });
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    // backend may return { token } or { accessToken } or { jwt }
    const res = await api.post<Record<string, any>>(ENDPOINTS.auth.login, {
      usernameOrEmail,
      password,
    });
    const candidate = res?.token ?? res?.accessToken ?? res?.jwt;
    if (!isJwt(candidate)) {
      localStorage.removeItem("token");
      throw new Error(
        (res && (res.message || res.error || res.code)) ||
          "Δεν ελήφθη έγκυρο JWT από τον διακομιστή."
      );
    }
    localStorage.setItem("token", candidate);
    const d = jwtDecode<Decoded>(candidate);
    setUser({
      usernameOrEmail: String(d.sub),
      roles: normalizeRoles(d.roles),
    });
  };

  const register = async (payload: any) => {
    await api.post(ENDPOINTS.auth.register, payload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const hasRole = (...roles: Role[]) =>
    !!user && roles.some((r) => user.roles.includes(r));

  const value = useMemo(
    () => ({ user, login, register, logout, hasRole }),
    [user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
