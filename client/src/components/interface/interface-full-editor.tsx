"use client";

/**
 * 接口完整编辑：基础信息、请求、响应、调试、高级 Mock
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, Pencil, Save, Trash2 } from "lucide-react";
import { useInterfaceEditLock } from "../../lib/hooks/use-interface-edit-lock";
import { interfaceApi, projectApi } from "../../lib/api/client";
import type { InterfaceDetail, ProjectEnvItem, ProjectTagItem } from "../../lib/api/types";
import { MethodBadge } from "./method-badge";
import { InterfaceAdvMockPanel } from "./interface-adv-mock-panel";
import { InterfaceRunPanel } from "./interface-run-panel";
import { ParamTableEditor, type ParamRow } from "../shared/param-table-editor";
import { JsonSchemaField } from "../shared/json-schema-field";
import { FormBodyEditor, type FormBodyRow } from "../shared/form-body-editor";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { MarkdownRichEditor } from "../shared/markdown-rich-editor";
import { MarkdownPreview } from "../shared/markdown-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

interface InterfaceFullEditorProps {
  interfaceId: number;
  onDeleted?: () => void;
  onSaved?: () => void;
}

export function InterfaceFullEditor({
  interfaceId,
  onDeleted,
  onSaved,
}: InterfaceFullEditorProps) {
  const [data, setData] = useState<InterfaceDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [envs, setEnvs] = useState<ProjectEnvItem[]>([]);
  const [projectTags, setProjectTags] = useState<ProjectTagItem[]>([]);
  const editLock = useInterfaceEditLock({
    interfaceId,
    active: editing,
  });

  const [form, setForm] = useState({
    title: "",
    path: "",
    method: "GET",
    status: "done",
    desc: "",
    markdown: "",
    req_body_type: "json",
    req_body_other: "",
    res_body_type: "json",
    res_body: "",
    req_query: [] as ParamRow[],
    req_headers: [] as ParamRow[],
    req_params: [] as ParamRow[],
    req_body_is_json_schema: false,
    res_body_is_json_schema: false,
    api_opened: false,
    tagText: "",
    req_body_form: [] as FormBodyRow[],
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
        markdown: d.markdown || "",
        req_body_type: d.req_body_type || "json",
        req_body_other: d.req_body_other || "",
        res_body_type: d.res_body_type || "json",
        res_body: d.res_body || "",
        req_query: (d.req_query as ParamRow[]) || [],
        req_headers: (d.req_headers as ParamRow[]) || [],
        req_params: (d.req_params as ParamRow[]) || [],
        req_body_is_json_schema: !!d.req_body_is_json_schema,
        res_body_is_json_schema: !!d.res_body_is_json_schema,
        api_opened: !!d.api_opened,
        tagText: (d.tag || []).join(", "),
        req_body_form: (d.req_body_form as FormBodyRow[]) || [],
      });
      if (d.project_id) {
        const [envRes, projRes] = await Promise.all([
          projectApi.getEnv(d.project_id),
          projectApi.get(d.project_id),
        ]);
        const envData = envRes.data as { env?: ProjectEnvItem[] };
        setEnvs(envData?.env || []);
        const proj = projRes.data as { tag?: ProjectTagItem[] };
        setProjectTags(proj?.tag || []);
      }
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
        catid: data.catid,
        title: form.title,
        path: form.path,
        method: form.method,
        status: form.status,
        desc: form.desc,
        markdown: form.markdown,
        req_body_type: form.req_body_type,
        req_body_other: form.req_body_other,
        res_body_type: form.res_body_type,
        res_body: form.res_body,
        req_query: form.req_query,
        req_headers: form.req_headers,
        req_params: form.req_params,
        req_body_is_json_schema: form.req_body_is_json_schema,
        res_body_is_json_schema: form.res_body_is_json_schema,
        api_opened: form.api_opened,
        tag: form.tagText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        req_body_form: form.req_body_form,
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
    return <p className="py-12 text-center text-sm text-muted-foreground">接口不存在</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MethodBadge method={editing ? form.method : data.method} />
            <CardTitle>{editing ? form.title : data.title}</CardTitle>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {editing ? form.path : data.path}
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !!editLock.conflict}
              >
                <Save className="mr-1 h-4 w-4" />
                {saving ? "保存中…" : "保存"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  editLock.release();
                  setEditing(false);
                }}
              >
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
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {editing && editLock.conflict ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0" />
              {editLock.conflict.username} 正在编辑此接口，当前为只读预览，请稍后再试。
            </AlertDescription>
          </Alert>
        ) : null}
        {editing && editLock.error ? (
          <Alert className="mb-4">
            <AlertDescription>{editLock.error}</AlertDescription>
          </Alert>
        ) : null}
        {editing && editLock.hasLock ? (
          <p className="mb-2 text-xs text-muted-foreground">已获取协同编辑锁</p>
        ) : null}

        <Tabs defaultValue="view">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="view">概览</TabsTrigger>
            <TabsTrigger value="request">请求</TabsTrigger>
            <TabsTrigger value="response">响应</TabsTrigger>
            <TabsTrigger value="run">调试</TabsTrigger>
            <TabsTrigger value="mock">高级 Mock</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="mt-4 space-y-4">
            {editing && !editLock.conflict ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>完成状态</Label>
                    <select
                      className="flex h-9 w-full rounded-md border px-3 text-sm"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="done">已完成</option>
                      <option value="undone">未完成</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.api_opened}
                        onChange={(e) => setForm((f) => ({ ...f, api_opened: e.target.checked }))}
                      />
                      开放接口
                    </label>
                  </div>
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
                      className="flex h-9 w-full rounded-md border px-3 text-sm"
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
                    className="font-mono"
                    value={form.path}
                    onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>标签（逗号分隔）</Label>
                  <Input
                    value={form.tagText}
                    onChange={(e) => setForm((f) => ({ ...f, tagText: e.target.value }))}
                    placeholder="例如：用户,核心"
                    list="project-tag-suggestions"
                  />
                  <datalist id="project-tag-suggestions">
                    {projectTags.map((t) => (
                      <option key={t.name} value={t.name} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>备注</Label>
                  <Textarea
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Markdown 文档</Label>
                  <MarkdownRichEditor
                    value={form.markdown}
                    onChange={(markdown) => setForm((f) => ({ ...f, markdown }))}
                    height={260}
                  />
                </div>
              </>
            ) : (
              <>
                {data.desc ? <p className="text-sm text-muted-foreground">{data.desc}</p> : null}
                {(data.tag || []).length > 0 ? (
                  <p className="text-xs text-muted-foreground">标签：{(data.tag || []).join(" · ")}</p>
                ) : null}
                {form.markdown || data.markdown ? (
                  <MarkdownPreview content={form.markdown || data.markdown || ""} />
                ) : null}
              </>
            )}
          </TabsContent>

          <TabsContent value="request" className="mt-4 space-y-4">
            <div>
              <Label className="mb-2 block">Path 参数</Label>
              <ParamTableEditor
                rows={form.req_params}
                onChange={(req_params) => setForm((f) => ({ ...f, req_params }))}
                readOnly={!editing || !!editLock.conflict}
              />
            </div>
            <div>
              <Label className="mb-2 block">Query</Label>
              <ParamTableEditor
                rows={form.req_query}
                onChange={(req_query) => setForm((f) => ({ ...f, req_query }))}
                showRequired
                readOnly={!editing || !!editLock.conflict}
              />
            </div>
            <div>
              <Label className="mb-2 block">Headers</Label>
              <ParamTableEditor
                rows={form.req_headers}
                onChange={(req_headers) => setForm((f) => ({ ...f, req_headers }))}
                readOnly={!editing || !!editLock.conflict}
              />
            </div>
            <JsonSchemaField
              label="请求 Body（JSON Schema）"
              enabled={form.req_body_is_json_schema}
              onEnabledChange={(req_body_is_json_schema) =>
                setForm((f) => ({ ...f, req_body_is_json_schema }))
              }
              schemaText={form.req_body_other}
              onSchemaTextChange={(req_body_other) =>
                setForm((f) => ({ ...f, req_body_other }))
              }
              disabled={!editing || !!editLock.conflict}
            />
            {!form.req_body_is_json_schema ? (
              <div className="space-y-2">
                <Label>Body 类型</Label>
                <select
                  className="h-9 rounded-md border px-2 text-sm"
                  value={form.req_body_type}
                  disabled={!editing || !!editLock.conflict}
                  onChange={(e) => setForm((f) => ({ ...f, req_body_type: e.target.value }))}
                >
                  <option value="json">json</option>
                  <option value="form">form</option>
                  <option value="raw">raw</option>
                </select>
                {form.req_body_type === "form" ? (
                  editing ? (
                    <FormBodyEditor
                      rows={form.req_body_form}
                      onChange={(req_body_form) => setForm((f) => ({ ...f, req_body_form }))}
                    />
                  ) : (
                    <JsonCodeEditor
                      value={JSON.stringify(form.req_body_form, null, 2)}
                      readOnly
                      height={200}
                      language="json"
                    />
                  )
                ) : (
                  <JsonCodeEditor
                    value={form.req_body_other}
                    readOnly={!editing || !!editLock.conflict}
                    height={280}
                    language={form.req_body_type === "json" ? "json" : "javascript"}
                    onChange={
                      !editing || editLock.conflict
                        ? undefined
                        : (req_body_other) =>
                            setForm((f) => ({ ...f, req_body_other }))
                    }
                  />
                )}
              </div>
            ) : null}
            {editing && !editLock.conflict ? (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                保存请求配置
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                进入编辑模式以修改
              </Button>
            )}
          </TabsContent>

          <TabsContent value="response" className="mt-4 space-y-4">
            <JsonSchemaField
              label="响应 Body（JSON Schema）"
              enabled={form.res_body_is_json_schema}
              onEnabledChange={(res_body_is_json_schema) =>
                setForm((f) => ({ ...f, res_body_is_json_schema }))
              }
              schemaText={form.res_body}
              onSchemaTextChange={(res_body) => setForm((f) => ({ ...f, res_body }))}
              disabled={!editing || !!editLock.conflict}
            />
            {!form.res_body_is_json_schema ? (
              <JsonCodeEditor
                value={form.res_body}
                readOnly={!editing || !!editLock.conflict}
                height={320}
                onChange={
                  !editing || editLock.conflict
                    ? undefined
                    : (res_body) => setForm((f) => ({ ...f, res_body }))
                }
              />
            ) : null}
            {editing && !editLock.conflict ? (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                保存响应
              </Button>
            ) : null}
          </TabsContent>

          <TabsContent value="run" className="mt-4">
            <InterfaceRunPanel data={{ ...data, ...form }} envs={envs} />
          </TabsContent>

          <TabsContent value="mock" className="mt-4">
            {data.project_id ? (
              <InterfaceAdvMockPanel
                projectId={data.project_id}
                interfaceId={interfaceId}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
