"use client";

/**
 * 项目数据：环境、Token、导入导出
 */
import { useCallback, useEffect, useState } from "react";
import { interfaceApi, openApi, pluginApi, projectApi } from "../../lib/api/client";
import type { ProjectEnvItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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

export function ProjectDataPanel({ projectId }: ProjectDataPanelProps) {
  const [envs, setEnvs] = useState<ProjectEnvItem[]>([]);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [importType, setImportType] = useState("json");
  const [importJson, setImportJson] = useState("");
  const [merge, setMerge] = useState("normal");
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [envRes, tokenRes] = await Promise.all([
        projectApi.getEnv(projectId),
        projectApi.getToken(projectId),
      ]);
      const envData = envRes.data as { env?: ProjectEnvItem[] };
      setEnvs(envData?.env?.length ? envData.env : [{ name: "", domain: "" }]);
      setToken((tokenRes.data as string) || "");
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

  async function refreshToken() {
    try {
      const res = await projectApi.updateToken(projectId);
      setToken((res.data as string) || "");
      console.log("Token 已更新", projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新 Token 失败");
    }
  }

  /** 从 JSON 文件批量上传接口（Chrome 插件同款接口） */
  async function handleFileUpload(file: File) {
    setImporting(true);
    setError("");
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await interfaceApi.interUpload({
        project_id: projectId,
        data,
      });
      console.log("文件导入成功", projectId, file.name);
    } catch (err) {
      console.error("文件导入失败", err);
      setError(err instanceof Error ? err.message : "文件导入失败");
    } finally {
      setImporting(false);
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

  return (
    <div className="space-y-8">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-medium">环境配置</h3>
        {envs.map((env, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded border p-3 sm:flex-row">
            <Input
              placeholder="环境名称"
              value={env.name}
              onChange={(e) => {
                const next = [...envs];
                next[idx] = { ...next[idx], name: e.target.value };
                setEnvs(next);
              }}
            />
            <Input
              placeholder="域名，如 https://api.example.com"
              value={env.domain}
              onChange={(e) => {
                const next = [...envs];
                next[idx] = { ...next[idx], domain: e.target.value };
                setEnvs(next);
              }}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEnvs([...envs, { name: "", domain: "" }])}
          >
            添加环境
          </Button>
          <Button type="button" size="sm" onClick={saveEnv}>
            保存环境
          </Button>
        </div>
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
          {token ? (
            <Button variant="outline" size="sm" asChild>
              <a
                href={openApi.projectInterfaceDataUrl(projectId, token)}
                target="_blank"
                rel="noreferrer"
              >
                Open API 导出
              </a>
            </Button>
          ) : null}
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
        <Textarea
          rows={8}
          placeholder="粘贴 JSON 或 Swagger URL"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          className="font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={importing} onClick={handleImport}>
            {importing ? "导入中…" : "开始导入"}
          </Button>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" disabled={importing} asChild>
              <span>上传 JSON 文件</span>
            </Button>
          </label>
        </div>
      </section>
    </div>
  );
}
