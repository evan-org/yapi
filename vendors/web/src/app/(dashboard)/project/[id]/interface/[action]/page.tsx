"use client";

/**
 * 项目接口区：api / col / case（核心编辑器迁移占位）
 */
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectInterfacePage() {
  const params = useParams();
  const action = String(params.action || "api");

  const titles: Record<string, string> = {
    api: "接口管理",
    col: "测试集合",
    case: "测试用例",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titles[action] || action}</CardTitle>
        <CardDescription>
          项目 {params.id} · 模块「{action}」正在从 Ant Design 迁移至 shadcn/ui。
          复杂表单（Postman、Schema 编辑器等）将分阶段接入。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          当前 Next 前端已打通登录、分组与项目导航；接口编辑等重功能可暂时通过旧版 Vite 客户端访问。
        </p>
        <Button variant="outline" asChild>
          <Link href={`/group`}>返回分组</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
