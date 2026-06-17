import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "@/types";
import { authService } from "@/services";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (u: string, p: string, role: Role) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(authService.getCurrentUser()); }, []);

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    async login(username, password, role) {
      const res = await authService.login(username, password, role);
      setUser(res.user);
      return res.user;
    },
    logout() { authService.logout(); setUser(null); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
