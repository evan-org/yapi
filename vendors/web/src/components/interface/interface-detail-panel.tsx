"use client";

/**
 * 接口详情：查看与基础编辑
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { interfaceApi } from "../../lib/api/interface";
import type { InterfaceDetail } from "../../lib/api/types";
import { MethodBadge } from "./method-badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { InterfaceAdvMockPanel } from "./interface-adv-mock-panel";
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

interface InterfaceDetailPanelProps {
  interfaceId: number;
  onDeleted?: () => void;
  onSaved?: () => void;
}

export function InterfaceDetailPanel({
  interfaceId,
  onDeleted,
  onSaved,
}: InterfaceDetailPanelProps) {
  const [data, setData] = useState<InterfaceDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    path: "",
    method: "GET",
    status: "done",
    desc: "",
    res_body: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await interfaceApi.get(interfaceId);
      const d = res.data as InterfaceDetail;
      setData(d);
      setForm({
        title: d.title || "",
        path: d.path || "",
        method: d.method || "GET",
        status: d.status || "done",
        desc: d.desc || "",
        res_body: d.res_body || "",
      });
    } catch (err) {
      console.error("加载接口详情失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [interfaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      await interfaceApi.update({
        id: data._id,
        title: form.title,
        path: form.path,
        method: form.method,
        status: form.status,
        desc: form.desc,
        res_body: form.res_body,
        catid: data.catid,
        req_body_type: data.req_body_type || "json",
        res_body_type: data.res_body_type || "json",
      });
      setEditing(false);
      await load();
      onSaved?.();
      console.log("接口已保存", data._id);
    } catch (err) {
      console.error("保存接口失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!data || !confirm(`确定删除接口「${data.title}」？`)) return;
    try {
      await interfaceApi.del(data._id);
      onDeleted?.();
    } catch (err) {
      console.error("删除接口失败", err);
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        加载接口…
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "接口不存在"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MethodBadge method={editing ? form.method : data.method} />
              {editing ? form.title : data.title}
            </CardTitle>
            <p className="font-mono text-sm text-muted-foreground">
              {editing ? form.path : data.path}
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? "保存中…" : "保存"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  编辑
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  删除
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>名称</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>方法</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
                    value={form.method}
                    onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                  >
                    {HTTP_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>路径</Label>
                <Input
                  value={form.path}
                  onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>响应 Body（JSON/Text）</Label>
                <Textarea
                  value={form.res_body}
                  onChange={(e) => setForm((f) => ({ ...f, res_body: e.target.value }))}
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
            </>
          ) : (
            <>
              {data.desc ? (
                <p className="text-sm text-muted-foreground">{data.desc}</p>
              ) : null}
              {data.username ? (
                <p className="text-xs text-muted-foreground">维护人：{data.username}</p>
              ) : null}
              {data.req_query && data.req_query.length > 0 ? (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Query</h4>
                  <div className="overflow-x-auto rounded border text-xs">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-2 py-1 text-left">参数</th>
                          <th className="px-2 py-1 text-left">示例</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.req_query.map((q, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1 font-mono">{q.name}</td>
                            <td className="px-2 py-1">{q.example || q.value || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              {data.res_body ? (
                <div>
                  <h4 className="mb-2 text-sm font-medium">响应示例</h4>
                  <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs">
                    {data.res_body}
                  </pre>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
      {data?.project_id ? (
        <InterfaceAdvMockPanel
          projectId={data.project_id}
          interfaceId={interfaceId}
        />
      ) : null}
    </div>
  );
}
