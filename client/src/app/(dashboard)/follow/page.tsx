"use client";

/**
 * 我的关注项目
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { followApi } from "../../../lib/api/follow";
import type { FollowItem } from "../../../lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";

export default function FollowPage() {
  const [list, setList] = useState<FollowItem[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await followApi.list();
      const data = res.data as { list?: FollowItem[] };
      setList(data?.list || []);
    } catch (err) {
      console.error("加载关注列表失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUnfollow(projectid: number) {
    try {
      await followApi.del(projectid);
      await load();
    } catch (err) {
      console.error("取消关注失败", err);
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[#2395f1]" />
          我的关注
        </CardTitle>
        <CardDescription>快速进入收藏的项目</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <CardContent className="flex items-center justify-between gap-2 p-4">
                <Link
                  href={`/project/${item.projectid}/interface/api`}
                  className="min-w-0 flex-1 hover:text-[#2395f1]"
                >
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color || "#2395f1" }}
                  />
                  <span className="font-medium">{item.projectname || `项目 ${item.projectid}`}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleUnfollow(item.projectid)}
                  title="取消关注"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">暂无关注项目</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
