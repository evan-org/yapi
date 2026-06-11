"use client";

/**
 * 首页：未登录展示落地页，已登录跳转分组
 */
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Boxes, Zap } from "lucide-react";
import { useAuth, LoginState } from "../lib/auth/auth-context";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const { loginState } = useAuth();

  useEffect(() => {
    if (loginState === LoginState.MEMBER) {
      router.replace("/group");
    }
  }, [loginState, router]);

  if (loginState === LoginState.LOADING || loginState === LoginState.MEMBER) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">加载中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2395f1]/5 to-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2395f1] text-white">
            Y
          </span>
          YAPI
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <a
              href="https://hellosean1025.github.io/yapi/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              文档
            </a>
          </Button>
          <Button asChild>
            <Link href="/login">
              登录
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              高效、易用的
              <br />
              <span className="text-[#2395f1]">API 管理平台</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              为研发团队提供接口文档、Mock、测试与协作能力。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/login">开始使用</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/group">进入工作台</Link>
              </Button>
            </div>
          </div>
          <Card className="border-[#2395f1]/20 shadow-lg">
            <CardHeader>
              <CardTitle>接口工作台预览</CardTitle>
              <CardDescription>可视化协作界面</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex gap-2">
                <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">GET</span>
                <span className="text-muted-foreground">/api/user/status</span>
              </div>
              <pre className="rounded-lg bg-muted p-4 text-[11px] leading-relaxed">
{`{
  "errcode": 0,
  "errmsg": "成功！",
  "data": { ... }
}`}
              </pre>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Boxes, title: "分组与项目", desc: "按团队组织接口与权限" },
            { icon: Zap, title: "Mock & 测试", desc: "内置 Mock 与测试集合" },
            { icon: BookOpen, title: "开放文档", desc: "自动生成可分享的 API 文档" },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="mb-2 h-8 w-8 text-[#2395f1]" />
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
