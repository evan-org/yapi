"use client";

/**
 * 已登录区域外壳：顶栏 + 内容区 + 加载态
 */
import { useAuth, LoginState } from "../../lib/auth/auth-context";
import { SiteHeader } from "./site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loginState } = useAuth();

  if (loginState === LoginState.LOADING) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">正在加载…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        YApi · Next.js + shadcn/ui
      </footer>
    </div>
  );
}
