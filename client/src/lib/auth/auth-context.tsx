"use client";

/**
 * 全局登录态：对接 /api/user/status Cookie 会话
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ApiCode, type LoginStatusData } from "../api/types";
import { userApi } from "../api/client";

export const LoginState = {
  LOADING: 0,
  GUEST: 1,
  MEMBER: 2,
} as const;

export type LoginStateValue = (typeof LoginState)[keyof typeof LoginState];

interface AuthContextValue {
  loginState: LoginStateValue;
  user: LoginStatusData | null;
  isLDAP: boolean;
  canRegister: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loginState, setLoginState] = useState<LoginStateValue>(LoginState.LOADING);
  const [user, setUser] = useState<LoginStatusData | null>(null);
  const [isLDAP, setIsLDAP] = useState(false);
  const [canRegister, setCanRegister] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await userApi.status();
      const ok = res.errcode === ApiCode.SUCCESS && res.data;
      if (ok) {
        setUser(res.data as LoginStatusData);
        setLoginState(LoginState.MEMBER);
      } else {
        setUser(null);
        setLoginState(LoginState.GUEST);
      }
      setIsLDAP(Boolean((res as { ladp?: boolean }).ladp));
      setCanRegister((res as { canRegister?: boolean }).canRegister !== false);
    } catch (err) {
      console.error("[AuthProvider] 登录态检查失败", err);
      setUser(null);
      setLoginState(LoginState.GUEST);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error("[AuthProvider] 退出失败", err);
    } finally {
      setUser(null);
      setLoginState(LoginState.GUEST);
      router.push("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      loginState,
      user,
      isLDAP,
      canRegister,
      refresh,
      logout,
    }),
    [loginState, user, isLDAP, canRegister, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 AuthProvider 内使用");
  }
  return ctx;
}
