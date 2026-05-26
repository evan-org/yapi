"use client";

/**
 * gen-services 代码生成向导：拉取全量 JSON、预览、下载
 */
import { useState } from "react";
import { builtinApi } from "../../lib/api/builtin";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { Alert, AlertDescription } from "../ui/alert";

interface GenServicesWizardProps {
  projectId: number;
}

type WizardStep = 1 | 2 | 3;

export function GenServicesWizard({ projectId }: GenServicesWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [interfaceCount, setInterfaceCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const exportUrl = builtinApi.exportFullUrl(projectId);
  const downloadUrl = statusFilter
    ? `${exportUrl}&status=${statusFilter}`
    : exportUrl;

  async function fetchPreview() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(downloadUrl, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      setPreview(text.slice(0, 12000));
      try {
        const json = JSON.parse(text) as { list?: unknown[] }[];
        let count = 0;
        if (Array.isArray(json)) {
          json.forEach((cat) => {
            if (cat && Array.isArray(cat.list)) {
              count += cat.list.length;
            }
          });
        }
        setInterfaceCount(count);
        console.log("全量导出预览加载成功", projectId, count);
      } catch {
        setInterfaceCount(0);
      }
      setStep(2);
    } catch (err) {
      console.error("加载全量导出失败", err);
      setError(err instanceof Error ? err.message : "加载失败，请检查登录与项目权限");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex gap-2 text-xs">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={
              step === n
                ? "rounded bg-[#2395f1] px-2 py-0.5 text-white"
                : "rounded bg-muted px-2 py-0.5 text-muted-foreground"
            }
          >
            步骤 {n}
          </span>
        ))}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            从开放接口拉取项目全量接口 JSON，供 gen-services 或自定义模板生成服务端代码。
          </p>
          <div className="space-y-2">
            <Label>接口状态筛选（可选 query status）</Label>
            <select
              className="h-9 w-full rounded-md border px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部</option>
              <option value="done">已完成</option>
              <option value="undone">未完成</option>
            </select>
          </div>
          <code className="block break-all rounded bg-muted px-3 py-2 text-xs">{downloadUrl}</code>
          <Button type="button" disabled={loading} onClick={fetchPreview}>
            {loading ? "加载中…" : "拉取并预览"}
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <p className="text-sm">
            已加载预览（约 {interfaceCount} 个接口，正文截断至 12KB）。
          </p>
          <JsonCodeEditor value={preview} readOnly height={360} language="json" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              上一步
            </Button>
            <Button type="button" onClick={() => setStep(3)}>
              下一步：下载
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            下载全量 JSON 后，在团队 CI 或 gen-services 模板中引用。也可复制下方链接。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" asChild>
              <a href={downloadUrl} target="_blank" rel="noreferrer">
                下载全量 JSON
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(downloadUrl);
                console.log("已复制导出链接", downloadUrl);
              }}
            >
              复制链接
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              返回预览
            </Button>
          </div>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
            <li>确保项目 Token 或登录态可访问开放接口</li>
            <li>生成代码前建议先合并接口状态为 done</li>
            <li>Base Path 会写入导出 JSON 的 proBasepath 字段</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
