"use client";

/**
 * 管理员用户列表
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userApi, type UserRecord } from "@/lib/api/user";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await userApi.list(page, 20);
      const data = res.data as { list: UserRecord[]; total: number };
      setList(data.list || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("加载用户列表失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [page]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/group");
      return;
    }
    if (user?.role === "admin") {
      load();
    }
  }, [user, router, load]);

  if (user?.role !== "admin") {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">用户名</th>
                <th className="px-3 py-2 text-left">邮箱</th>
                <th className="px-3 py-2 text-left">角色</th>
                <th className="px-3 py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="link" size="sm" asChild>
                      <Link href={`/user/profile/${u._id}`}>查看</Link>
                    </Button>
                    {u._id !== user?._id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!confirm(`确定删除用户 ${u.username}？`)) return;
                          try {
                            await userApi.del(u._id);
                            await load();
                          } catch (err) {
                            console.error("删除用户失败", err);
                            setError(err instanceof Error ? err.message : "删除失败");
                          }
                        }}
                      >
                        删除
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            共 {total} 人 · 第 {page}/{totalPages} 页
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
