"use client";

/**
 * 客户端全局 Provider
 */
import { AuthProvider } from "../lib/auth/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
