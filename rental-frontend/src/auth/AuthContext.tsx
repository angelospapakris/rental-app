import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { jwtDecode } from "jwt-decode";

type Role = "ADMIN" | "OWNER" | "TENANT";
type Decoded = { sub: string; roles?: Role[]; exp?: number; [k: string]: any };

type User = {
  id?: number;
  email: string;
  roles: Role[];
};

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // bootstrap from existing token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const d = jwtDecode<Decoded>(token);
      if (d.exp && d.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return;
      }
      setUser({ email: d.sub, roles: (d.roles || []) as Role[] });
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string }>(ENDPOINTS.auth.login, { email, password });
    localStorage.setItem("token", data.token);
    const d = jwt_decode<Decoded>(data.token);
    setUser({ email: d.sub, roles: (d.roles || []) as Role[] });
  };

  const register = async (payload: any) => {
    await api.post(ENDPOINTS.auth.register, payload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => !!user && roles.some(r => user.roles.includes(r));

  const value = useMemo(() => ({ user, login, register, logout, hasRole }), [user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
