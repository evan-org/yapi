"use client";

/**
 * 项目动态
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { logApi } from "@/lib/api/log";
import type { LogItem } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectActivityPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await logApi.list({ type: "project", typeid: projectId, limit: 30 });
      const data = res.data;
      setLogs(data?.list || []);
    } catch (err) {
      console.error("加载动态失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>项目动态</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log._id} className="rounded-lg border px-4 py-3 text-sm">
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: log.content || "" }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {log.username || "系统"} ·{" "}
                {log.add_time ? new Date(log.add_time * 1000).toLocaleString() : ""}
              </p>
            </li>
          ))}
        </ul>
        {logs.length === 0 && !error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">暂无动态</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
