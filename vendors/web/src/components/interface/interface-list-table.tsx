"use client";

/**
 * 接口表格列表（分页），可筛选状态
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { interfaceApi } from "../../lib/api/client";
import type { InterfaceListItem } from "../../lib/api/types";
import { MethodBadge } from "./method-badge";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";

interface InterfaceListTableProps {
  projectId: number;
  catId?: number;
}

export function InterfaceListTable({ projectId, catId }: InterfaceListTableProps) {
  const [list, setList] = useState<InterfaceListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const limit = 15;

  const load = useCallback(async () => {
    setError("");
    try {
      const opts = { page, limit, status: status || undefined };
      const res = catId
        ? await interfaceApi.listByCat(catId, opts)
        : await interfaceApi.list(projectId, opts);
      const data = res.data as { list: InterfaceListItem[]; total: number };
      setList(data.list || []);
      setTotalPages(Math.max(1, data.total || 1));
    } catch (err) {
      console.error("加载接口列表失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId, catId, page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">全部状态</option>
          <option value="done">已完成</option>
          <option value="undone">未完成</option>
        </select>
        <Button size="sm" variant="outline" onClick={load}>
          刷新
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs">
            <tr>
              <th className="px-3 py-2">方法</th>
              <th className="px-3 py-2">名称</th>
              <th className="px-3 py-2">路径</th>
              <th className="px-3 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item._id} className="border-t hover:bg-accent/30">
                <td className="px-3 py-2">
                  <MethodBadge method={item.method} />
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/project/${projectId}/interface/api/${item._id}`}
                    className="font-medium hover:text-[#2395f1]"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.path}</td>
                <td className="px-3 py-2">
                  <Badge variant={item.status === "done" ? "secondary" : "outline"}>
                    {item.status === "done" ? "完成" : item.status || "—"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">暂无接口</p>
      ) : null}

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          第 {page} / {totalPages} 页
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            上一页
          </Button>
          <Button
            size="sm"
            variant="outline"
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
