"use client";

/**
 * 非 api 的接口子模块（测试集合等）
 */
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectInterfaceActionPage() {
  const params = useParams();
  const router = useRouter();
  const action = String(params.action || "");
  const projectId = params.id;

  useEffect(() => {
    if (action === "api") {
      router.replace(`/project/${projectId}/interface/api`);
    }
  }, [action, projectId, router]);

  if (action === "api") {
    return null;
  }

  const titles: Record<string, string> = {
    col: "测试集合",
    case: "测试用例",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titles[action] || action}</CardTitle>
        <CardDescription>项目 {projectId} · 模块迁移中</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          测试集合与自动化用例将在后续迭代迁移；接口管理请使用「接口」页签。
        </p>
        <Button variant="outline" asChild>
          <Link href={`/project/${projectId}/interface/api`}>前往接口管理</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
