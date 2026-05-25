"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

export default function UserListPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">管理员用户列表迁移中。</CardContent>
    </Card>
  );
}
