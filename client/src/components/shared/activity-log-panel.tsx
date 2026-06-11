"use client";

/**
 * 分组 / 项目动态列表
 */
import { useCallback, useEffect, useState } from "react";
import { logApi } from "../../lib/api/log";
import type { LogItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";

interface ActivityLogPanelProps {
  type: "group" | "project";
  typeid: number;
}

export function ActivityLogPanel({ type, typeid }: ActivityLogPanelProps) {
  const [list, setList] = useState<LogItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await logApi.list({ type, typeid, page, limit: 20 });
      const data = res.data as { list: LogItem[]; total: number };
      setList(data.list || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("加载动态失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [type, typeid, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <ul className="space-y-3">
        {list.map((item) => (
          <li key={item._id} className="rounded-lg border px-4 py-3 text-sm">
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: String(item.content || "") }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {item.username || "系统"} ·{" "}
              {item.add_time
                ? new Date(item.add_time * 1000).toLocaleString("zh-CN")
                : ""}
            </p>
          </li>
        ))}
      </ul>
      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">暂无动态</p>
      ) : null}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          共 {total} 条 · {page}/{totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
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
    </div>
  );
}
