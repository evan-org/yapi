"use client";

/**
 * 测试用例详情：加载用例、编辑名称与请求参数、调试
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Play, Save, Trash2 } from "lucide-react";
import { colApi, projectApi } from "../../lib/api/client";
import type { InterfaceDetail, ProjectEnvItem } from "../../lib/api/types";
import { MethodBadge } from "./method-badge";
import { InterfaceRunPanel, type RunResponsePayload } from "./interface-run-panel";
import { ParamTableEditor, type ParamRow } from "../shared/param-table-editor";
import { VariablePicker } from "../shared/variable-picker";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";

/** 用例详情（合并接口默认字段后的结构） */
interface CaseDetail {
  _id: number;
  casename: string;
  col_id: number;
  project_id: number;
  interface_id: number;
  path?: string;
  method?: string;
  req_body_type?: string;
  req_body_other?: string;
  req_query?: ParamRow[];
  req_headers?: ParamRow[];
  res_body?: string;
  test_script?: string;
}

interface InterfaceCaseDetailProps {
  projectId: number;
  caseId: number;
}

export function InterfaceCaseDetail({ projectId, caseId }: InterfaceCaseDetailProps) {
  const router = useRouter();
  const [data, setData] = useState<CaseDetail | null>(null);
  const [lastResponse, setLastResponse] = useState<RunResponsePayload | null>(null);
  const [assertMsg, setAssertMsg] = useState("");
  const [insertField, setInsertField] = useState<"body" | "query" | "script">("body");
  const [envIndex, setEnvIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [envs, setEnvs] = useState<ProjectEnvItem[]>([]);
  const [basepath, setBasepath] = useState("");
  const [form, setForm] = useState({
    casename: "",
    req_body_other: "",
    req_query: [] as ParamRow[],
    req_headers: [] as ParamRow[],
    test_script: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await colApi.getCase(caseId);
      const d = res.data as CaseDetail;
      setData(d);
      setForm({
        casename: d.casename || "",
        req_body_other: d.req_body_other || "",
        req_query: (d.req_query as ParamRow[]) || [],
        req_headers: (d.req_headers as ParamRow[]) || [],
        test_script: d.test_script || "",
      });
      if (d.project_id) {
        const [envRes, projRes] = await Promise.all([
          projectApi.getEnv(d.project_id),
          projectApi.get(d.project_id),
        ]);
        const envData = envRes.data as { env?: ProjectEnvItem[] };
        setEnvs(envData?.env || []);
        setBasepath(((projRes.data as { basepath?: string })?.basepath) || "");
      }
    } catch (err) {
      console.error("加载用例失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      await colApi.upCase({
        id: data._id,
        casename: form.casename,
        req_body_other: form.req_body_other,
        req_query: form.req_query,
        req_headers: form.req_headers,
        test_script: form.test_script,
      });
      await load();
      console.log("用例已保存", data._id);
    } catch (err) {
      console.error("保存用例失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        加载用例…
      </div>
    );
  }

  async function handleDelete() {
    if (!data || !confirm(`确定删除用例「${data.casename}」？`)) return;
    try {
      await colApi.delCase(data._id);
      router.push(`/project/${projectId}/interface/col`);
    } catch (err) {
      console.error("删除用例失败", err);
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function handleRunAssert() {
    if (!data || !lastResponse) {
      setAssertMsg("请先在「调试」Tab 发送请求");
      return;
    }
    if (!form.test_script.trim()) {
      setAssertMsg("请先编写断言脚本");
      return;
    }
    setAssertMsg("");
    try {
      const res = await colApi.runScript({
        col_id: data.col_id,
        interface_id: data.interface_id,
        script: form.test_script,
        response: {
          status: lastResponse.status,
          body: lastResponse.body,
          header: lastResponse.header,
        },
        records: {},
        params: {},
      });
      setAssertMsg(res.errcode === 0 ? "断言通过" : res.errmsg || "断言失败");
      console.log("断言执行完成", caseId, res.errcode);
    } catch (err) {
      console.error("断言执行失败", err);
      setAssertMsg(err instanceof Error ? err.message : "断言失败");
    }
  }

  if (!data) {
    return <p className="py-12 text-center text-sm text-muted-foreground">用例不存在</p>;
  }

  const runData = {
    ...data,
    ...form,
    title: form.casename,
    _id: data.interface_id,
    catid: 0,
    path: data.path || "",
    method: data.method || "GET",
  } as InterfaceDetail;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-sm text-muted-foreground">
            <Link href={`/project/${projectId}/interface/col`} className="hover:text-[#2395f1]">
              测试集合
            </Link>
            <span className="mx-2">/</span>
            <span>用例</span>
          </div>
          <div className="flex items-center gap-2">
            <MethodBadge method={data.method || "GET"} />
            <CardTitle>{form.casename || data.casename}</CardTitle>
          </div>
          <p className="font-mono text-sm text-muted-foreground">{data.path}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            {saving ? "保存中…" : "保存"}
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-1 h-4 w-4" />
            删除
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="run">调试</TabsTrigger>
            <TabsTrigger value="test">断言</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <VariablePicker
                envs={envs}
                envIndex={envIndex}
                caseKey={data._id}
                onInsert={(text) => {
                  if (insertField === "body") {
                    setForm((f) => ({
                      ...f,
                      req_body_other: `${f.req_body_other || ""}${text}`,
                    }));
                  } else if (insertField === "script") {
                    setForm((f) => ({
                      ...f,
                      test_script: `${f.test_script || ""}${text}`,
                    }));
                  } else {
                    setForm((f) => {
                      const rows = [...f.req_query];
                      if (rows.length === 0) {
                        rows.push({ name: "", value: text, example: "", required: "0" });
                      } else {
                        const last = rows[rows.length - 1];
                        rows[rows.length - 1] = {
                          ...last,
                          value: `${last.value || ""}${text}`,
                        };
                      }
                      return { ...f, req_query: rows };
                    });
                  }
                }}
              />
              {envs.length > 1 ? (
                <select
                  className="h-8 rounded-md border px-2 text-xs"
                  value={envIndex}
                  onChange={(e) => setEnvIndex(Number(e.target.value))}
                >
                  {envs.map((e, i) => (
                    <option key={i} value={i}>
                      {e.name || `环境 ${i + 1}`}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className={insertField === "body" ? "font-medium text-[#2395f1]" : "text-muted-foreground"}
                onClick={() => setInsertField("body")}
              >
                插入到 Body
              </button>
              <button
                type="button"
                className={insertField === "query" ? "font-medium text-[#2395f1]" : "text-muted-foreground"}
                onClick={() => setInsertField("query")}
              >
                插入到 Query
              </button>
              <button
                type="button"
                className={insertField === "script" ? "font-medium text-[#2395f1]" : "text-muted-foreground"}
                onClick={() => setInsertField("script")}
              >
                插入到断言脚本
              </button>
            </div>
            <div className="space-y-2">
              <Label>用例名称</Label>
              <Input
                value={form.casename}
                onChange={(e) => setForm((f) => ({ ...f, casename: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-2 block">Query</Label>
              <ParamTableEditor
                rows={form.req_query}
                onChange={(req_query) => setForm((f) => ({ ...f, req_query }))}
                showRequired
              />
            </div>
            <div>
              <Label className="mb-2 block">Headers</Label>
              <ParamTableEditor
                rows={form.req_headers}
                onChange={(req_headers) => setForm((f) => ({ ...f, req_headers }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <div onFocus={() => setInsertField("body")}>
                <JsonCodeEditor
                  value={form.req_body_other}
                  height={280}
                  onChange={(req_body_other) =>
                    setForm((f) => ({ ...f, req_body_other }))
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="run" className="mt-4">
            <InterfaceRunPanel
              data={runData}
              envs={envs}
              basepath={basepath}
              onResult={(payload) => setLastResponse(payload)}
            />
          </TabsContent>
          <TabsContent value="test" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>断言脚本（JavaScript）</Label>
              <div onFocus={() => setInsertField("script")}>
                <JsonCodeEditor
                  language="javascript"
                  height={240}
                  placeholder="assert.equal(status, 200)"
                  value={form.test_script}
                  onChange={(test_script) =>
                    setForm((f) => ({ ...f, test_script }))
                  }
                />
              </div>
            </div>
            <Button size="sm" onClick={handleRunAssert}>
              <Play className="mr-1 h-4 w-4" />
              运行断言（需先调试请求）
            </Button>
            {assertMsg ? (
              <p className="text-sm text-muted-foreground">{assertMsg}</p>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
