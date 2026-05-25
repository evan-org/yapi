"use client";

import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import Link from "next/link";

export default function AddProjectPage() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          新建项目
        </CardTitle>
        <CardDescription>创建向导将接入分组选择与项目模板</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>表单迁移中。请先在分组页进入已有项目，或暂时使用旧版客户端创建。</p>
        <Button asChild>
          <Link href="/group">前往分组</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
