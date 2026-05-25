"use client";

/**
 * 高级 Mock：脚本与期望列表（对接 advmock 插件 API）
 */
import { useCallback, useEffect, useState } from "react";
import { pluginApi } from "@/lib/api/plugin";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { Alert, AlertDescription } from "../ui/alert";

interface InterfaceAdvMockPanelProps {
  projectId: number;
  interfaceId: number;
}

export function InterfaceAdvMockPanel({
  projectId,
  interfaceId,
}: InterfaceAdvMockPanelProps) {
  const [error, setError] = useState("");
  const [script, setScript] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [cases, setCases] = useState<unknown[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [mockRes, caseRes] = await Promise.all([
        pluginApi.advMockGet(interfaceId),
        pluginApi.advMockCaseList(interfaceId),
      ]);
      const mock = mockRes.data as { mock_script?: string; enable?: boolean };
      setScript(mock?.mock_script || "");
      setEnabled(Boolean(mock?.enable));
      setCases((caseRes.data as unknown[]) || []);
    } catch (err) {
      console.error("加载高级 Mock 失败", err);
    }
  }, [interfaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await pluginApi.advMockSave({
        project_id: projectId,
        interface_id: interfaceId,
        mock_script: script,
        enable: enabled,
      });
      await load();
      console.log("高级 Mock 已保存", interfaceId);
    } catch (err) {
      console.error("保存高级 Mock 失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-medium">高级 Mock</h3>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="adv-mock-enable"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <Label htmlFor="adv-mock-enable" className="font-normal">
          启用自定义 Mock 脚本
        </Label>
      </div>
      <div className="space-y-2">
        <Label>Mock 脚本</Label>
        <JsonCodeEditor
          language="javascript"
          height={220}
          value={script}
          onChange={setScript}
          placeholder="返回 mock 数据的 JS 脚本"
        />
      </div>
      <Button type="button" size="sm" disabled={saving} onClick={handleSave}>
        {saving ? "保存中…" : "保存 Mock 配置"}
      </Button>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">
          期望用例数：{Array.isArray(cases) ? cases.length : 0}
        </p>
      </div>
    </div>
  );
}
