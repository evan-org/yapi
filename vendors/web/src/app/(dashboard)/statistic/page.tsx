"use client";

/**
 * 系统统计（管理员）
 */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pluginApi } from "@/lib/api/plugin";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StatisticPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [system, setSystem] = useState<Record<string, unknown>>({});

  const load = useCallback(async () => {
    setError("");
    try {
      const [countRes, statusRes] = await Promise.all([
        pluginApi.statisticsCount(),
        pluginApi.systemStatus(),
      ]);
      setCounts((countRes.data as Record<string, number>) || {});
      setSystem((statusRes.data as Record<string, unknown>) || {});
    } catch (err) {
      console.error("加载统计失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

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

  const statItems = [
    { label: "分组总数", key: "groupCount" },
    { label: "项目总数", key: "projectCount" },
    { label: "接口总数", key: "interfaceCount" },
    { label: "测试用例总数", key: "interfaceCaseCount" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">系统信息</h1>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card key={item.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[#2395f1]">
                {counts[item.key] ?? "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>运行环境</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(system).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono text-xs">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
