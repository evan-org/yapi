"use client";

/**
 * 接口管理主工作区：侧栏 + 详情
 */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { interfaceApi } from "../../lib/api/interface";
import type { InterfaceCatItem } from "../../lib/api/types";
import { InterfaceSidebar } from "./interface-sidebar";
import { InterfaceFullEditor } from "./interface-full-editor";
import { InterfaceModuleTabs } from "./interface-module-tabs";
import { InterfaceListTable } from "./interface-list-table";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface InterfaceApiWorkspaceProps {
  projectId: number;
  interfaceId?: number;
}

export function InterfaceApiWorkspace({ projectId, interfaceId }: InterfaceApiWorkspaceProps) {
  const router = useRouter();
  const [menu, setMenu] = useState<InterfaceCatItem[]>([]);
  const [error, setError] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showAddApi, setShowAddApi] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [newApi, setNewApi] = useState({
    catid: "",
    title: "",
    path: "/api/example",
    method: "GET",
  });

  const loadMenu = useCallback(async () => {
    setError("");
    try {
      const res = await interfaceApi.listMenu(projectId);
      setMenu((res.data as InterfaceCatItem[]) || []);
    } catch (err) {
      console.error("加载接口菜单失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  async function handleAddApi() {
    if (!newApi.catid || !newApi.title.trim() || !newApi.path.trim()) return;
    try {
      const res = await interfaceApi.add({
        project_id: projectId,
        catid: Number(newApi.catid),
        title: newApi.title.trim(),
        path: newApi.path.trim(),
        method: newApi.method,
        status: "done",
      });
      const data = res.data as { _id?: number };
      setShowAddApi(false);
      await loadMenu();
      if (data?._id) {
        router.push(`/project/${projectId}/interface/api/${data._id}`);
      }
    } catch (err) {
      console.error("新建接口失败", err);
      setError(err instanceof Error ? err.message : "新建接口失败");
    }
  }

  async function handleAddCat() {
    if (!newCatName.trim()) return;
    try {
      await interfaceApi.addCat({
        project_id: projectId,
        name: newCatName.trim(),
      });
      setNewCatName("");
      setShowAddCat(false);
      await loadMenu();
    } catch (err) {
      console.error("新建分类失败", err);
      setError(err instanceof Error ? err.message : "新建分类失败");
    }
  }

  async function handleMoveCat(catid: number, direction: "up" | "down") {
    const idx = menu.findIndex((c) => c._id === catid);
    if (idx < 0) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= menu.length) return;
    const items = menu.map((c, i) => {
      if (i === idx) return { id: c._id, index: swap };
      if (i === swap) return { id: menu[swap]._id, index: idx };
      return { id: c._id, index: i };
    });
    try {
      await interfaceApi.upCatIndex(items);
      await loadMenu();
    } catch (err) {
      console.error("调整分类顺序失败", err);
      setError(err instanceof Error ? err.message : "排序失败");
    }
  }

  async function handleMoveInterface(
    ifaceId: number,
    catid: number,
    direction: "up" | "down"
  ) {
    const cat = menu.find((c) => c._id === catid);
    const list = cat?.list || [];
    const idx = list.findIndex((it) => it._id === ifaceId);
    if (idx < 0) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= list.length) return;
    const items = list.map((it, i) => {
      if (i === idx) return { id: it._id, index: swap };
      if (i === swap) return { id: list[swap]._id, index: idx };
      return { id: it._id, index: i };
    });
    try {
      await interfaceApi.upIndex(items);
      await loadMenu();
    } catch (err) {
      console.error("调整接口顺序失败", err);
      setError(err instanceof Error ? err.message : "排序失败");
    }
  }

  async function handleDelCat(catid: number, name: string) {
    if (!confirm(`确定删除分类「${name}」及其下接口？`)) return;
    try {
      await interfaceApi.delCat(catid);
      await loadMenu();
      if (interfaceId) {
        router.push(`/project/${projectId}/interface/api`);
      }
    } catch (err) {
      console.error("删除分类失败", err);
      setError(err instanceof Error ? err.message : "删除分类失败");
    }
  }

  return (
    <div>
      <InterfaceModuleTabs />
      <div className="mb-3 flex gap-2">
        <Button
          size="sm"
          variant={viewMode === "tree" ? "default" : "outline"}
          onClick={() => setViewMode("tree")}
        >
          树形
        </Button>
        <Button
          size="sm"
          variant={viewMode === "table" ? "default" : "outline"}
          onClick={() => setViewMode("table")}
        >
          表格
        </Button>
      </div>

      {viewMode === "table" && !interfaceId ? (
        <InterfaceListTable projectId={projectId} />
      ) : null}

      <div className={`flex flex-col gap-4 lg:flex-row ${viewMode === "table" && !interfaceId ? "hidden" : ""}`}>
      <InterfaceSidebar
        projectId={projectId}
        menu={menu}
        activeId={interfaceId}
        onAddCat={() => setShowAddCat(true)}
        onDelCat={handleDelCat}
        onMoveCat={handleMoveCat}
        onMoveInterface={handleMoveInterface}
      />

      <div className="min-w-0 flex-1">
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddApi(!showAddApi)}>
            新建接口
          </Button>
        </div>

        {showAddApi ? (
          <Card className="mb-4">
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>分类</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                  value={newApi.catid}
                  onChange={(e) => setNewApi((f) => ({ ...f, catid: e.target.value }))}
                >
                  <option value="">选择分类</option>
                  {menu.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  value={newApi.title}
                  onChange={(e) => setNewApi((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>方法</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                  value={newApi.method}
                  onChange={(e) => setNewApi((f) => ({ ...f, method: e.target.value }))}
                >
                  {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>路径</Label>
                <Input
                  className="font-mono"
                  value={newApi.path}
                  onChange={(e) => setNewApi((f) => ({ ...f, path: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button onClick={handleAddApi}>创建</Button>
                <Button variant="outline" onClick={() => setShowAddApi(false)}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {showAddCat ? (
          <Card className="mb-4">
            <CardContent className="flex flex-wrap items-end gap-3 pt-6">
              <div className="min-w-[200px] flex-1 space-y-2">
                <Label>新分类名称</Label>
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="例如：用户模块"
                />
              </div>
              <Button onClick={handleAddCat}>创建</Button>
              <Button variant="outline" onClick={() => setShowAddCat(false)}>
                取消
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {interfaceId ? (
          <InterfaceFullEditor
            interfaceId={interfaceId}
            onDeleted={() => {
              loadMenu();
              router.push(`/project/${projectId}/interface/api`);
            }}
            onSaved={loadMenu}
          />
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              请从左侧选择接口，或新建分类后添加接口
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
