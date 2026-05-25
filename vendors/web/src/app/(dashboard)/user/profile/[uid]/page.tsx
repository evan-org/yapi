"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserProfilePage() {
  const params = useParams();
  return (
    <Card>
      <CardHeader>
        <CardTitle>个人中心</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        用户 ID：{params.uid} · 资料与密码修改迁移中。
      </CardContent>
    </Card>
  );
}
