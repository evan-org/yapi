"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

export default function FollowPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[#2395f1]" />
          我的关注
        </CardTitle>
        <CardDescription>收藏的项目将显示在这里</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        关注列表功能迁移中，与旧版 /follow 路由对齐。
      </CardContent>
    </Card>
  );
}
