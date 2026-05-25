"use client";

/**
 * 项目数据：环境（含 header/global）、项目脚本、Token、导入导出
 */
import { useCallback, useEffect, useState } from "react";
import { openApi, pluginApi, projectApi } from "../../lib/api/client";
import type { ProjectEnvItem, ProjectEnvKeyValue } from "../../lib/api/types";
import { ParamTableEditor, type ParamRow } from "../shared/param-table-editor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { Alert, AlertDescription } from "../ui/alert";

interface ProjectDataPanelProps {
  projectId: number;
}

const IMPORT_TYPES = [
  { key: "json", label: "YApi JSON" },
  { key: "postman", label: "Postman" },
  { key: "har", label: "HAR" },
  { key: "swagger", label: "Swagger URL/JSON" },
];

const EXPORT_LINKS = [
  { key: "html", label: "HTML", href: (pid: number) => pluginApi.exportData("html", pid) },
  { key: "markdown", label: "Markdown", href: (pid: number) => pluginApi.exportData("markdown", pid) },
  { key: "json", label: "JSON", href: (pid: number) => pluginApi.exportData("json", pid) },
  { key: "swagger2", label: "Swagger2", href: (pid: number) => pluginApi.exportSwagger2Url(pid) },
];

function emptyEnv(): ProjectEnvItem {
  return { name: "", domain: "", header: [], global: [] };
}

function kvToParamRows(list: ProjectEnvKeyValue[] | undefined): ParamRow[] {
  if (!list?.length) {
    return [];
  }
  return list.map((item) => ({
    name: item.name || "",
    value: item.value || "",
    example: "",
    desc: "",
  }));
}

function paramRowsToKv(rows: ParamRow[]): ProjectEnvKeyValue[] {
  return rows
    .filter((r) => r.name.trim())
    .map((r) => ({ name: r.name.trim(), value: r.value || "" }));
}

export function ProjectDataPanel({ projectId }: ProjectDataPanelProps) {
  const [envs, setEnvs] = useState<ProjectEnvItem[]>([emptyEnv()]);
  const [scripts, setScripts] = useState({
    pre_script: "",
    after_script: "",
    project_mock_script: "",
  });
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [importType, setImportType] = useState("json");
  const [importJson, setImportJson] = useState("");
  const [merge, setMerge] = useState("normal");
  const [importing, setImporting] = useState(false);
  const [expandedEnv, setExpandedEnv] = useState<number | null>(0);

  const load = useCallback(async () => {
    setError("");
    try {
      const [envRes, tokenRes, projRes] = await Promise.all([
        projectApi.getEnv(projectId),
        projectApi.getToken(projectId),
        projectApi.get(projectId),
      ]);
      const envData = envRes.data as { env?: ProjectEnvItem[] };
      const loaded = envData?.env?.length ? envData.env : [emptyEnv()];
      setEnvs(
        loaded.map((e) => ({
          name: e.name || "",
          domain: e.domain || "",
          header: e.header || [],
          global: e.global || [],
        }))
      );
      setToken((tokenRes.data as string) || "");
      const p = projRes.data as {
        pre_script?: string;
        after_script?: string;
        project_mock_script?: string;
      };
      setScripts({
        pre_script: p.pre_script || "",
        after_script: p.after_script || "",
        project_mock_script: p.project_mock_script || "",
      });
    } catch (err) {
      console.error("加载项目数据配置失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveEnv() {
    try {
      await projectApi.upEnv(projectId, envs);
      console.log("环境已保存", projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存环境失败");
    }
  }

  async function saveScripts() {
    try {
      await projectApi.upScripts({
        id: projectId,
        pre_script: scripts.pre_script,
        after_script: scripts.after_script,
        project_mock_script: scripts.project_mock_script,
      });
      console.log("项目脚本已保存", projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存脚本失败");
    }
  }

  async function refreshToken() {
    try {
      const res = await projectApi.updateToken(projectId);
      setToken((res.data as string) || "");
      console.log("Token 已更新", projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新 Token 失败");
    }
  }

  async function handleImport() {
    if (!importJson.trim()) {
      setError("请粘贴导入内容");
      return;
    }
    setImporting(true);
    setError("");
    try {
      await openApi.importData({
        type: importType,
        token,
        json: importJson,
        project_id: projectId,
        merge,
      });
      console.log("导入成功", projectId, importType);
      setImportJson("");
    } catch (err) {
      console.error("导入失败", err);
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
    }
  }

  function updateEnv(idx: number, patch: Partial<ProjectEnvItem>) {
    const next = [...envs];
    next[idx] = { ...next[idx], ...patch };
    setEnvs(next);
  }

  return (
    <div className="space-y-8">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-medium">环境配置</h3>
        <p className="text-xs text-muted-foreground">
          每个环境可配置域名、Header 与全局变量（global.*），供测试集合与变量选择器使用。
        </p>
        {envs.map((env, idx) => (
          <div key={idx} className="rounded border p-3 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="环境名称"
                value={env.name}
                onChange={(e) => updateEnv(idx, { name: e.target.value })}
              />
              <Input
                placeholder="域名，如 https://api.example.com"
                value={env.domain}
                onChange={(e) => updateEnv(idx, { domain: e.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpandedEnv(expandedEnv === idx ? null : idx)}
              >
                {expandedEnv === idx ? "收起高级" : "Header / 全局变量"}
              </Button>
            </div>
            {expandedEnv === idx ? (
              <div className="space-y-4 border-t pt-3">
                <div>
                  <Label className="mb-2 block text-xs">环境 Header</Label>
                  <ParamTableEditor
                    rows={kvToParamRows(env.header as ProjectEnvKeyValue[])}
                    onChange={(rows) =>
                      updateEnv(idx, { header: paramRowsToKv(rows) })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-xs">全局变量 global.*</Label>
                  <ParamTableEditor
                    rows={kvToParamRows(env.global as ProjectEnvKeyValue[])}
                    onChange={(rows) =>
                      updateEnv(idx, { global: paramRowsToKv(rows) })
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEnvs([...envs, emptyEnv()])}
          >
            添加环境
          </Button>
          <Button type="button" size="sm" onClick={saveEnv}>
            保存环境
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">项目脚本</h3>
        <p className="text-xs text-muted-foreground">
          测试集合执行前后的公共脚本（JavaScript），与单接口脚本叠加执行。
        </p>
        <div className="space-y-2">
          <Label>Pre-request 脚本</Label>
          <JsonCodeEditor
            language="javascript"
            height={180}
            value={scripts.pre_script}
            onChange={(pre_script) =>
              setScripts((s) => ({ ...s, pre_script }))
            }
            placeholder="// 请求前执行"
          />
        </div>
        <div className="space-y-2">
          <Label>After-request 脚本</Label>
          <JsonCodeEditor
            language="javascript"
            height={180}
            value={scripts.after_script}
            onChange={(after_script) =>
              setScripts((s) => ({ ...s, after_script }))
            }
            placeholder="// 请求后执行"
          />
        </div>
        <div className="space-y-2">
          <Label>项目 Mock 脚本</Label>
          <JsonCodeEditor
            language="javascript"
            height={160}
            value={scripts.project_mock_script}
            onChange={(project_mock_script) =>
              setScripts((s) => ({ ...s, project_mock_script }))
            }
          />
        </div>
        <Button type="button" size="sm" onClick={saveScripts}>
          保存脚本
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">项目 Token</h3>
        <p className="text-xs text-muted-foreground">用于开放接口导入等操作</p>
        <div className="flex gap-2">
          <Input readOnly value={token} className="font-mono text-xs" />
          <Button type="button" variant="outline" onClick={refreshToken}>
            更新
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">导出接口文档</h3>
        <div className="flex flex-wrap gap-2">
          {EXPORT_LINKS.map((t) => (
            <Button key={t.key} variant="outline" size="sm" asChild>
              <a href={t.href(projectId)} target="_blank" rel="noreferrer">
                {t.label}
              </a>
            </Button>
          ))}
          <Button variant="outline" size="sm" asChild>
            <a href={pluginApi.exportFullUrl(projectId)} target="_blank" rel="noreferrer">
              全量 JSON
            </a>
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">导入数据</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs">类型</Label>
          <select
            className="h-9 rounded-md border px-2 text-sm"
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
          >
            {IMPORT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <Label className="text-xs">合并策略</Label>
          <select
            className="h-9 rounded-md border px-2 text-sm"
            value={merge}
            onChange={(e) => setMerge(e.target.value)}
          >
            <option value="normal">普通</option>
            <option value="good">智能合并</option>
            <option value="merge">完全覆盖</option>
          </select>
        </div>
        <JsonCodeEditor
          value={importJson}
          height={320}
          language="json"
          placeholder="粘贴 JSON 或 Swagger URL"
          onChange={setImportJson}
        />
        <Button type="button" disabled={importing} onClick={handleImport}>
          {importing ? "导入中…" : "开始导入"}
        </Button>
      </section>
    </div>
  );
}
