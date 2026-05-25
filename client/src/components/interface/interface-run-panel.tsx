"use client";

/**
 * 接口调试：根据当前接口与环境域名发起请求
 */
import { useState } from "react";
import type { InterfaceDetail } from "../../lib/api/types";
import type { ProjectEnvItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { Alert, AlertDescription } from "../ui/alert";

export interface RunResponsePayload {
  status: number;
  body: unknown;
  header: Record<string, string>;
  text: string;
}

interface InterfaceRunPanelProps {
  data: InterfaceDetail;
  envs: ProjectEnvItem[];
  /** 请求完成后回调（用于断言脚本） */
  onResult?: (payload: RunResponsePayload) => void;
}

export function InterfaceRunPanel({ data, envs, onResult }: InterfaceRunPanelProps) {
  const [envIndex, setEnvIndex] = useState(0);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    setLoading(true);
    setError("");
    setResult("");
    const env = envs[envIndex];
    const base = (env?.domain || "").replace(/\/$/, "");
    const path = data.path?.startsWith("/") ? data.path : `/${data.path || ""}`;
    const url = base ? `${base}${path}` : path;

    try {
      const headers: Record<string, string> = {};
      (data.req_headers || []).forEach((h) => {
        if (h.name) {
          headers[h.name] = h.value || h.example || "";
        }
      });

      let body: string | undefined;
      if (data.req_body_type === "json" && data.req_body_other) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        body = data.req_body_other;
      }

      const res = await fetch(url, {
        method: data.method || "GET",
        headers,
        body: ["GET", "HEAD"].includes(data.method || "GET") ? undefined : body,
        credentials: "omit",
      });

      const text = await res.text();
      setResult(`HTTP ${res.status} ${res.statusText}\n\n${text}`);
      let parsedBody: unknown = text;
      try {
        parsedBody = JSON.parse(text);
      } catch {
        /* 保持文本 */
      }
      onResult?.({
        status: res.status,
        body: parsedBody,
        header: Object.fromEntries(res.headers.entries()),
        text,
      });
      console.log("接口调试完成", url, res.status);
    } catch (err) {
      console.error("接口调试失败", err);
      setError(
        err instanceof Error
          ? `${err.message}（跨域时请在浏览器插件或同域 Mock 下测试）`
          : "请求失败"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        使用项目环境中的域名拼接路径发起真实请求；Mock 请访问 /mock 路径。
      </p>
      {envs.length > 0 ? (
        <div className="flex items-center gap-2">
          <Label className="text-xs">环境</Label>
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
      ) : (
        <Alert>
          <AlertDescription>请先在项目设置中配置环境域名。</AlertDescription>
        </Alert>
      )}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="button" onClick={handleRun} disabled={loading || envs.length === 0}>
        {loading ? "请求中…" : `发送 ${data.method || "GET"}`}
      </Button>
      {result ? (
        <JsonCodeEditor value={result} readOnly height={360} language="json" />
      ) : null}
    </div>
  );
}
