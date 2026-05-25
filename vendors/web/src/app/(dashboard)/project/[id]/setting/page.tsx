"use client";

/**
 * 项目基础设置
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { projectApi } from "@/lib/api/project";
import type { ProjectItem } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectSettingPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    basepath: "",
    desc: "",
  });

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await projectApi.get(projectId);
      const p = res.data as ProjectItem;
      setForm({
        name: p.name || "",
        basepath: (p.basepath as string) || "",
        desc: (p.desc as string) || "",
      });
    } catch (err) {
      console.error("加载项目失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await projectApi.update({
        id: projectId,
        name: form.name,
        basepath: form.basepath,
        desc: form.desc,
      });
      console.log("项目设置已保存", projectId);
    } catch (err) {
      console.error("保存项目失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>项目设置</CardTitle>
        <CardDescription>基础信息（环境、Token、Mock 等高级设置后续接入）</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label>项目名称</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Base Path</Label>
            <Input
              value={form.basepath}
              onChange={(e) => setForm((f) => ({ ...f, basepath: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              rows={4}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
