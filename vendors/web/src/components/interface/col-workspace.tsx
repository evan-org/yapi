"use client";

/**
 * 测试集合工作区
 */
import { useCallback, useEffect, useState } from "react";
import { colApi, interfaceApi } from "../../lib/api/client";
import type { InterfaceCatItem, InterfaceColItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { MethodBadge } from "./method-badge";

interface ColWorkspaceProps {
  projectId: number;
}

export function ColWorkspace({ projectId }: ColWorkspaceProps) {
  const [cols, setCols] = useState<InterfaceColItem[]>([]);
  const [menu, setMenu] = useState<InterfaceCatItem[]>([]);
  const [activeColId, setActiveColId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [newColName, setNewColName] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [colRes, menuRes] = await Promise.all([
        colApi.list(projectId),
        interfaceApi.listMenu(projectId),
      ]);
      const list = (colRes.data as InterfaceColItem[]) || [];
      setCols(list);
      setMenu((menuRes.data as InterfaceCatItem[]) || []);
    } catch (err) {
      console.error("加载测试集合失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    if (cols.length > 0 && activeColId === null) {
      setActiveColId(cols[0]._id);
    }
  }, [cols, activeColId]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCol = cols.find((c) => c._id === activeColId);

  async function handleAddCol() {
    if (!newColName.trim()) return;
    try {
      await colApi.addCol({ project_id: projectId, name: newColName.trim() });
      setNewColName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    }
  }

  async function handleImportAllInterfaces() {
    if (!activeColId) return;
    const ids: number[] = [];
    menu.forEach((cat) => {
      (cat.list || []).forEach((it) => ids.push(it._id));
    });
    if (ids.length === 0) {
      setError("没有可导入的接口");
      return;
    }
    try {
      await colApi.addCaseList({
        project_id: projectId,
        col_id: activeColId,
        interface_list: ids,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="w-full rounded-lg border bg-card lg:w-56">
        <div className="border-b p-3">
          <p className="text-sm font-medium">测试集合</p>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="新集合名称"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={handleAddCol}>
              +
            </Button>
          </div>
        </div>
        <ul className="p-2">
          {cols.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  activeColId === c._id ? "bg-[#2395f1]/10 text-[#2395f1]" : "hover:bg-accent"
                }`}
                onClick={() => setActiveColId(c._id)}
              >
                {c.name}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({c.caseList?.length || 0})
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {activeCol ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{activeCol.name}</CardTitle>
              <Button size="sm" variant="outline" onClick={handleImportAllInterfaces}>
                导入全部接口为用例
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(activeCol.caseList || []).map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
                  >
                    {c.method ? <MethodBadge method={c.method} /> : null}
                    <span className="font-medium">{c.casename}</span>
                    {c.path ? (
                      <span className="font-mono text-xs text-muted-foreground">{c.path}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {(activeCol.caseList || []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  暂无用例，可点击「导入全部接口为用例」
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              请创建或选择测试集合
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
