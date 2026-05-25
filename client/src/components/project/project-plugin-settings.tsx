"use client";

/**
 * 项目插件设置：Swagger 自动同步、代码生成说明
 */
import { useCallback, useEffect, useState } from "react";
import { extensionsApi } from "../../lib/api/extensions";
import { GenServicesWizard } from "./gen-services-wizard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface ProjectPluginSettingsProps {
  projectId: number;
}

export function ProjectPluginSettings({ projectId }: ProjectPluginSettingsProps) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sync, setSync] = useState({
    sync_json_url: "",
    sync_cron: "0 0 2 * * *",
    sync_mode: "good",
    is_sync_open: false,
    id: undefined as number | undefined,
  });

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await extensionsApi.autoSyncGet(projectId);
      const data = res.data as {
        _id?: number;
        sync_json_url?: string;
        sync_cron?: string;
        sync_mode?: string;
        is_sync_open?: boolean;
      } | null;
      if (data) {
        setSync({
          id: data._id,
          sync_json_url: data.sync_json_url || "",
          sync_cron: data.sync_cron || "0 0 2 * * *",
          sync_mode: data.sync_mode || "good",
          is_sync_open: Boolean(data.is_sync_open),
        });
      }
    } catch (err) {
      console.error("加载 Swagger 同步配置失败", err);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSync() {
    setSaving(true);
    setError("");
    try {
      await extensionsApi.autoSyncSave({
        id: sync.id,
        project_id: projectId,
        sync_json_url: sync.sync_json_url,
        sync_cron: sync.sync_cron,
        sync_mode: sync.sync_mode,
        is_sync_open: sync.is_sync_open,
      });
      await load();
      console.log("Swagger 自动同步已保存", projectId);
    } catch (err) {
      console.error("保存同步配置失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
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
        <h3 className="text-sm font-medium">Swagger 自动同步</h3>
        <p className="text-xs text-muted-foreground">
          定时从 Swagger URL 拉取并合并到本项目（需服务端 node-schedule 正常）。
        </p>
        <div className="space-y-2">
          <Label>Swagger JSON URL</Label>
          <Input
            value={sync.sync_json_url}
            onChange={(e) => setSync((s) => ({ ...s, sync_json_url: e.target.value }))}
            placeholder="https://example.com/v2/api-docs"
          />
        </div>
        <div className="space-y-2">
          <Label>Cron 表达式</Label>
          <Input
            value={sync.sync_cron}
            onChange={(e) => setSync((s) => ({ ...s, sync_cron: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sync-open"
            checked={sync.is_sync_open}
            onChange={(e) => setSync((s) => ({ ...s, is_sync_open: e.target.checked }))}
          />
          <Label htmlFor="sync-open" className="text-sm font-normal">
            开启自动同步
          </Label>
        </div>
        <Button type="button" disabled={saving} onClick={saveSync}>
          {saving ? "保存中…" : "保存同步配置"}
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">代码生成（gen-services）</h3>
        <GenServicesWizard projectId={projectId} />
      </section>
    </div>
  );
}
