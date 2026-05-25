"use client";

/**
 * 项目设置：基础信息、环境、Token、数据导入导出
 */
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectApi } from "@/lib/api/project";
import type { ProjectItem, ProjectTagItem } from "@/lib/api/types";
import { ProjectDataPanel } from "@/components/project/project-data-panel";
import { ProjectExtensionSettings } from "@/components/project/project-extension-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectSettingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    basepath: "",
    desc: "",
  });
  const [tags, setTags] = useState<ProjectTagItem[]>([]);
  const [tagText, setTagText] = useState("");

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
      setTags(p.tag || []);
      setTagText((p.tag || []).map((t) => t.name).join(", "));
      setGroupId(p.group_id);
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
      const tagList = tagText
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, desc: name }));
      await projectApi.upTag(projectId, tagList);
      setTags(tagList);
      console.log("项目设置已保存", projectId);
    } catch (err) {
      console.error("保存项目失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyProject() {
    const newName = window.prompt("复制后的项目名称", `${form.name} 副本`);
    if (!newName?.trim()) return;
    setDangerLoading(true);
    setError("");
    try {
      const detail = await projectApi.get(projectId);
      const payload = detail.data as Record<string, unknown>;
      await projectApi.copy({
        ...payload,
        _id: projectId,
        name: newName.trim(),
      });
      console.log("项目已复制", projectId, newName);
      if (groupId) {
        router.push(`/group/${groupId}`);
      } else {
        router.push("/group");
      }
    } catch (err) {
      console.error("复制项目失败", err);
      setError(err instanceof Error ? err.message : "复制失败");
    } finally {
      setDangerLoading(false);
    }
  }

  async function handleDeleteProject() {
    if (
      !window.confirm(
        `确定删除项目「${form.name}」？将同时删除其下所有接口与测试集，且不可恢复。`
      )
    ) {
      return;
    }
    setDangerLoading(true);
    setError("");
    try {
      await projectApi.del(projectId);
      console.log("项目已删除", projectId);
      if (groupId) {
        router.push(`/group/${groupId}`);
      } else {
        router.push("/group");
      }
    } catch (err) {
      console.error("删除项目失败", err);
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDangerLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">项目设置</h1>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基础信息</TabsTrigger>
          <TabsTrigger value="data">环境与数据</TabsTrigger>
          <TabsTrigger value="extensions">扩展</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>名称、Base Path、描述</CardDescription>
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
                <div className="space-y-2">
                  <Label>接口标签（逗号分隔）</Label>
                  <Input
                    value={tagText}
                    onChange={(e) => setTagText(e.target.value)}
                    placeholder="例如：核心,内部,废弃"
                  />
                  {tags.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      当前：{tags.map((t) => t.name).join("、")}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中…" : "保存"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>环境与数据</CardTitle>
              <CardDescription>环境变量、Token、导入导出</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectDataPanel projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="extensions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>扩展</CardTitle>
              <CardDescription>Swagger 自动同步、代码生成等</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectExtensionSettings projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">危险操作</CardTitle>
          <CardDescription>复制或删除当前项目，删除后数据无法恢复</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={dangerLoading}
            onClick={handleCopyProject}
          >
            复制项目
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={dangerLoading}
            onClick={handleDeleteProject}
          >
            删除项目
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
