"use client";

/**
 * 高级 Mock：脚本与期望用例 CRUD
 */
import { useCallback, useEffect, useState } from "react";
import { extensionsApi } from "../../lib/api/extensions";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { JsonCodeEditor } from "../shared/json-code-editor";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";

interface AdvMockCase {
  _id?: number;
  name?: string;
  code?: number;
  delay?: number;
  res_body?: string;
  ip_enable?: boolean;
  ip?: string;
  case_enable?: boolean;
}

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
  const [cases, setCases] = useState<AdvMockCase[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingCase, setEditingCase] = useState<AdvMockCase | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const [mockRes, caseRes] = await Promise.all([
        extensionsApi.advancedMockGet(interfaceId),
        extensionsApi.advancedMockCaseList(interfaceId),
      ]);
      const mock = mockRes.data as { mock_script?: string; enable?: boolean };
      setScript(mock?.mock_script || "");
      setEnabled(Boolean(mock?.enable));
      setCases((caseRes.data as AdvMockCase[]) || []);
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
      await extensionsApi.advancedMockSave({
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

  function startNewCase() {
    setEditingCase({
      name: "新期望",
      code: 200,
      delay: 0,
      res_body: "{}",
      ip_enable: false,
    });
  }

  async function handleSaveCase() {
    if (!editingCase) return;
    setError("");
    try {
      await extensionsApi.advancedMockCaseSave({
        project_id: projectId,
        interface_id: interfaceId,
        id: editingCase._id,
        name: editingCase.name,
        code: editingCase.code,
        delay: editingCase.delay,
        res_body: editingCase.res_body,
        ip_enable: editingCase.ip_enable,
        ip: editingCase.ip,
      });
      setEditingCase(null);
      await load();
      console.log("期望用例已保存", interfaceId);
    } catch (err) {
      console.error("保存期望失败", err);
      setError(err instanceof Error ? err.message : "保存期望失败");
    }
  }

  async function handleDelCase(id: number) {
    if (!confirm("确定删除该期望？")) return;
    try {
      await extensionsApi.advancedMockCaseDel(id);
      await load();
    } catch (err) {
      console.error("删除期望失败", err);
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function handleEditCase(id: number) {
    try {
      const res = await extensionsApi.advancedMockCaseGet(id);
      setEditingCase((res.data as AdvMockCase) || null);
    } catch (err) {
      console.error("加载期望失败", err);
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

      <div className="border-t pt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">期望用例</p>
          <Button type="button" size="sm" variant="outline" onClick={startNewCase}>
            新增期望
          </Button>
        </div>
        <ul className="space-y-2 text-sm">
          {cases.map((c) => (
            <li
              key={c._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2"
            >
              <span>
                {c.name} — HTTP {c.code}
                {c.case_enable === false ? "（已禁用）" : ""}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEditCase(c._id!)}>
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelCase(c._id!)}
                >
                  删除
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {editingCase ? (
          <div className="mt-4 space-y-2 rounded border bg-muted/30 p-3">
            <Input
              placeholder="期望名称"
              value={editingCase.name || ""}
              onChange={(e) => setEditingCase({ ...editingCase, name: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="HTTP Code"
                value={editingCase.code ?? 200}
                onChange={(e) =>
                  setEditingCase({ ...editingCase, code: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="延迟 ms"
                value={editingCase.delay ?? 0}
                onChange={(e) =>
                  setEditingCase({ ...editingCase, delay: Number(e.target.value) })
                }
              />
            </div>
            <Textarea
              rows={6}
              className="font-mono text-xs"
              placeholder="Response Body (JSON)"
              value={editingCase.res_body || ""}
              onChange={(e) => setEditingCase({ ...editingCase, res_body: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveCase}>
                保存期望
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingCase(null)}>
                取消
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
