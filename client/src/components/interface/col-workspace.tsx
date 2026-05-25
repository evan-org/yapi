"use client";

/**
 * 测试集合工作区
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { colApi, interfaceApi, projectApi } from "../../lib/api/client";
import type { InterfaceColDetail, InterfaceListItem } from "../../lib/api/types";
import { InterfaceModuleTabs } from "./interface-module-tabs";
import { ColBatchTestPanel } from "./col-batch-test-panel";
import type { InterfaceCatItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { MethodBadge } from "./method-badge";

interface ColWorkspaceProps {
  projectId: number;
  /** 路由深链指定的集合 id */
  initialColId?: number;
}

export function ColWorkspace({ projectId, initialColId }: ColWorkspaceProps) {
  const router = useRouter();
  const [cols, setCols] = useState<InterfaceColDetail[]>([]);
  const [menu, setMenu] = useState<InterfaceCatItem[]>([]);
  const [activeColId, setActiveColId] = useState<number | null>(null);
  const [basepath, setBasepath] = useState("");
  const [error, setError] = useState("");
  const [newColName, setNewColName] = useState("");
  const [pickOpen, setPickOpen] = useState(false);
  const [pickId, setPickId] = useState<number | "">("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [colRes, menuRes, projRes] = await Promise.all([
        colApi.list(projectId),
        interfaceApi.listMenu(projectId),
        projectApi.get(projectId),
      ]);
      const list = (colRes.data as InterfaceColDetail[]) || [];
      setBasepath(((projRes.data as { basepath?: string })?.basepath) || "");
      setCols(list);
      setMenu((menuRes.data as InterfaceCatItem[]) || []);
    } catch (err) {
      console.error("加载测试集合失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    if (initialColId && cols.some((c) => c._id === initialColId)) {
      setActiveColId(initialColId);
      return;
    }
    if (cols.length > 0 && activeColId === null) {
      setActiveColId(cols[0]._id);
    }
  }, [cols, activeColId, initialColId]);

  function selectCol(colId: number) {
    setActiveColId(colId);
    router.replace(`/project/${projectId}/interface/col/${colId}`);
  }

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

  async function handleDelCol(colId: number, name: string) {
    if (!confirm(`确定删除测试集合「${name}」？`)) return;
    try {
      await colApi.delCol(colId);
      setActiveColId(null);
      await load();
    } catch (err) {
      console.error("删除集合失败", err);
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function handleMoveCase(caseId: number, direction: "up" | "down") {
    if (!activeCol?.caseList) return;
    const list = [...activeCol.caseList];
    const idx = list.findIndex((c) => c._id === caseId);
    if (idx < 0) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= list.length) return;
    const items = list.map((c, i) => {
      if (i === idx) return { id: c._id, index: swap };
      if (i === swap) return { id: c._id, index: idx };
      return { id: c._id, index: i };
    });
    try {
      await colApi.upCaseIndex(items);
      await load();
    } catch (err) {
      console.error("调整用例顺序失败", err);
      setError(err instanceof Error ? err.message : "排序失败");
    }
  }

  async function handleDelCase(caseId: number, name: string) {
    if (!confirm(`确定删除用例「${name}」？`)) return;
    try {
      await colApi.delCase(caseId);
      await load();
    } catch (err) {
      console.error("删除用例失败", err);
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  const flatInterfaces: (InterfaceListItem & { catName: string })[] = [];
  menu.forEach((cat) => {
    (cat.list || []).forEach((it) => {
      flatInterfaces.push({ ...it, catName: cat.name });
    });
  });

  async function handleAddSingleCase() {
    if (!activeColId || !pickId) return;
    const item = flatInterfaces.find((it) => it._id === Number(pickId));
    if (!item) return;
    try {
      await colApi.addCase({
        project_id: projectId,
        col_id: activeColId,
        interface_id: item._id,
        casename: item.title,
      });
      setPickOpen(false);
      setPickId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加用例失败");
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
    <div>
      <InterfaceModuleTabs />
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
                onClick={() => selectCol(c._id)}
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
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>{activeCol.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setPickOpen(true)}>
                  添加单个用例
                </Button>
                <Button size="sm" variant="outline" onClick={handleImportAllInterfaces}>
                  导入全部接口为用例
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelCol(activeCol._id, activeCol.name)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  删除集合
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pickOpen ? (
                <div className="flex flex-wrap items-end gap-2 rounded border p-3">
                  <div className="min-w-[200px] flex-1">
                    <Label className="text-xs">选择接口</Label>
                    <select
                      className="mt-1 h-9 w-full rounded-md border px-2 text-sm"
                      value={pickId}
                      onChange={(e) =>
                        setPickId(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">请选择</option>
                      {flatInterfaces.map((it) => (
                        <option key={it._id} value={it._id}>
                          [{it.method}] {it.title} ({it.catName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" onClick={handleAddSingleCase}>
                    确认添加
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPickOpen(false)}>
                    取消
                  </Button>
                </div>
              ) : null}
              <ColBatchTestPanel
                projectId={projectId}
                col={activeCol}
                cases={activeCol.caseList || []}
                basepath={basepath}
                onReload={load}
              />
              <ul className="space-y-2">
                {(activeCol.caseList || []).map((c, idx) => (
                  <li key={c._id} className="flex items-center gap-1 rounded border pr-1">
                    <Link
                      href={`/project/${projectId}/interface/case/${c._id}`}
                      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm transition hover:bg-accent/50"
                    >
                      {c.method ? <MethodBadge method={c.method} /> : null}
                      <span className="font-medium">{c.casename}</span>
                      {c.path ? (
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          {c.path}
                        </span>
                      ) : null}
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={idx === 0}
                      title="上移"
                      onClick={() => handleMoveCase(c._id, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={idx === (activeCol.caseList?.length || 0) - 1}
                      title="下移"
                      onClick={() => handleMoveCase(c._id, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title="删除用例"
                      onClick={() => handleDelCase(c._id, c.casename)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
    </div>
  );
}
