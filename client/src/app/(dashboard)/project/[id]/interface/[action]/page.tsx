"use client";

/**
 * 非 api 的接口子模块（测试集合等）
 */
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ColWorkspace } from "@/components/interface/col-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectInterfaceActionPage() {
  const params = useParams();
  const router = useRouter();
  const action = String(params.action || "");
  const projectId = Number(params.id);

  useEffect(() => {
    if (action === "api") {
      router.replace(`/project/${params.id}/interface/api`);
    }
    if (action === "case") {
      router.replace(`/project/${params.id}/interface/col`);
    }
  }, [action, params.id, router]);

  if (action === "api" || action === "case") {
    return null;
  }

  if (action === "col") {
    return <ColWorkspace projectId={projectId} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{action}</CardTitle>
        <CardDescription>项目 {projectId}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">未知模块</CardContent>
    </Card>
  );
}
