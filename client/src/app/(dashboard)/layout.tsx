"use client";

/**
 * 需登录的工作台布局
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/layout/app-shell";
import { useAuth, LoginState } from "../../lib/auth/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loginState } = useAuth();

  useEffect(() => {
    if (loginState === LoginState.GUEST) {
      router.replace("/login");
    }
  }, [loginState, router]);

  if (loginState !== LoginState.MEMBER) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">正在验证登录…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
