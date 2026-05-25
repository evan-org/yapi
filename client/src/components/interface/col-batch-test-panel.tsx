"use client";

/**
 * 测试集合：服务端自动化 URL、浏览器顺序执行与断言
 */
import { useCallback, useEffect, useState } from "react";
import { colApi, openApi, projectApi } from "../../lib/api/client";
import type { InterfaceCaseItem, InterfaceColItem, ProjectEnvItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ColBatchTestPanelProps {
  projectId: number;
  col: InterfaceColItem;
  cases: InterfaceCaseItem[];
  onReload: () => void;
}

interface CaseRunResult {
  caseId: number;
  name: string;
  ok: boolean;
  message: string;
}

export function ColBatchTestPanel({ projectId, col, cases, onReload }: ColBatchTestPanelProps) {
  const [token, setToken] = useState("");
  const [envs, setEnvs] = useState<ProjectEnvItem[]>([]);
  const [envIndex, setEnvIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CaseRunResult[]>([]);
  const [error, setError] = useState("");
  const [rules, setRules] = useState({
    checkHttpCodeIs200: false,
    checkResponseSchema: false,
    checkScriptIsOpen: true,
  });

  const loadMeta = useCallback(async () => {
    try {
      const [tokenRes, envRes] = await Promise.all([
        projectApi.getToken(projectId),
        projectApi.getEnv(projectId),
      ]);
      setToken((tokenRes.data as string) || "");
      const envData = envRes.data as { env?: ProjectEnvItem[] };
      setEnvs(envData?.env || []);
      setRules({
        checkHttpCodeIs200: !!(col as { checkHttpCodeIs200?: boolean }).checkHttpCodeIs200,
        checkResponseSchema: !!(col as { checkResponseSchema?: boolean }).checkResponseSchema,
        checkScriptIsOpen: (col as { checkScriptIsOpen?: boolean }).checkScriptIsOpen !== false,
      });
    } catch (err) {
      console.error("加载测试元数据失败", err);
    }
  }, [projectId, col]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  async function saveRules() {
    try {
      await colApi.upCol({
        col_id: col._id,
        checkHttpCodeIs200: rules.checkHttpCodeIs200,
        checkResponseSchema: rules.checkResponseSchema,
        checkScriptIsOpen: rules.checkScriptIsOpen,
      });
      console.log("通用规则已保存", col._id);
      onReload();
    } catch (err) {
      console.error("保存规则失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  /** 浏览器内顺序执行：请求 + 断言脚本 */
  async function handleBatchRun() {
    if (cases.length === 0) {
      setError("没有可执行的用例");
      return;
    }
    const env = envs[envIndex];
    if (!env?.domain) {
      setError("请先在项目设置中配置环境域名");
      return;
    }

    setRunning(true);
    setError("");
    setResults([]);
    const base = env.domain.replace(/\/$/, "");
    const records: Record<number, { params: unknown; body: unknown }> = {};
    const out: CaseRunResult[] = [];

    for (const c of cases) {
      try {
        const detailRes = await colApi.getCase(c._id);
        const detail = detailRes.data as InterfaceCaseItem & {
          path?: string;
          method?: string;
          req_headers?: { name: string; value?: string; example?: string }[];
          req_body_other?: string;
          req_body_type?: string;
          test_script?: string;
        };

        const path = detail.path?.startsWith("/") ? detail.path : `/${detail.path || ""}`;
        const url = `${base}${path}`;
        const headers: Record<string, string> = {};
        (detail.req_headers || []).forEach((h) => {
          if (h.name) headers[h.name] = h.value || h.example || "";
        });

        let body: string | undefined;
        if (detail.req_body_type === "json" && detail.req_body_other) {
          headers["Content-Type"] = headers["Content-Type"] || "application/json";
          body = detail.req_body_other;
        }

        const res = await fetch(url, {
          method: detail.method || "GET",
          headers,
          body: ["GET", "HEAD"].includes(detail.method || "GET") ? undefined : body,
          credentials: "omit",
        });

        const text = await res.text();
        let parsedBody: unknown = text;
        try {
          parsedBody = JSON.parse(text);
        } catch {
          /* 非 JSON 保持文本 */
        }

        const response = {
          status: res.status,
          body: parsedBody,
          header: Object.fromEntries(res.headers.entries()),
        };

        records[c._id] = { params: {}, body: parsedBody };

        if (detail.test_script) {
          const scriptRes = await colApi.runScript({
            col_id: col._id,
            interface_id: detail.interface_id,
            script: detail.test_script,
            response,
            records,
            params: {},
          });
          const ok = scriptRes.errcode === 0;
          out.push({
            caseId: c._id,
            name: c.casename,
            ok,
            message: ok ? "断言通过" : scriptRes.errmsg || "断言未通过",
          });
        } else {
          out.push({
            caseId: c._id,
            name: c.casename,
            ok: res.ok,
            message: `HTTP ${res.status}`,
          });
        }
      } catch (err) {
        console.error("用例执行失败", c._id, err);
        out.push({
          caseId: c._id,
          name: c.casename,
          ok: false,
          message: err instanceof Error ? err.message : "执行失败",
        });
      }
    }

    setResults(out);
    setRunning(false);
    console.log("批量测试完成", col._id, out.filter((r) => r.ok).length, "/", out.length);
  }

  const autoTestUrl =
    token && col._id ? openApi.runAutoTestUrl(col._id, token) : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">自动化测试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2 text-sm">
          <p className="font-medium">通用规则</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.checkHttpCodeIs200}
              onChange={(e) => setRules((r) => ({ ...r, checkHttpCodeIs200: e.target.checked }))}
            />
            HTTP 状态码必须为 200
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.checkResponseSchema}
              onChange={(e) => setRules((r) => ({ ...r, checkResponseSchema: e.target.checked }))}
            />
            校验返回 JSON Schema
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.checkScriptIsOpen}
              onChange={(e) => setRules((r) => ({ ...r, checkScriptIsOpen: e.target.checked }))}
            />
            启用用例断言脚本
          </label>
          <Button size="sm" variant="outline" onClick={saveRules}>
            保存规则
          </Button>
        </div>

        {envs.length > 0 ? (
          <div className="flex items-center gap-2">
            <Label className="text-xs">执行环境</Label>
            <select
              className="h-9 rounded-md border px-2 text-sm"
              value={envIndex}
              onChange={(e) => setEnvIndex(Number(e.target.value))}
            >
              {envs.map((env, idx) => (
                <option key={idx} value={idx}>
                  {env.name || `环境${idx + 1}`} — {env.domain}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleBatchRun} disabled={running || cases.length === 0}>
            {running ? "测试中…" : "开始测试（浏览器）"}
          </Button>
          {autoTestUrl ? (
            <Button size="sm" variant="outline" asChild>
              <a href={autoTestUrl} target="_blank" rel="noreferrer">
                服务端测试（新窗口）
              </a>
            </Button>
          ) : null}
        </div>

        {autoTestUrl ? (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">服务端自动化 URL</Label>
            <Textarea readOnly rows={2} className="font-mono text-xs" value={autoTestUrl} />
          </div>
        ) : null}

        {results.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {results.map((r) => (
              <li
                key={r.caseId}
                className={r.ok ? "text-green-700" : "text-destructive"}
              >
                {r.ok ? "✓" : "✗"} {r.name} — {r.message}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
