"use client";

/**
 * 新建项目
 */
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { groupApi } from "../../../lib/api/group";
import { projectApi } from "../../../lib/api/project";
import type { GroupItem } from "../../../lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../components/ui/alert";

export default function AddProjectPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    group_id: "",
    basepath: "",
    desc: "",
    project_type: "private" as "public" | "private",
    icon: "",
    color: "",
  });

  const loadGroups = useCallback(async () => {
    try {
      const res = await groupApi.list();
      const list = (res.data as GroupItem[]) || [];
      setGroups(list);
      if (list.length > 0 && !form.group_id) {
        setForm((f) => ({ ...f, group_id: String(list[0]._id) }));
      }
    } catch (err) {
      console.error("加载分组失败", err);
    }
  }, [form.group_id]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await projectApi.add({
        name: form.name.trim(),
        group_id: Number(form.group_id),
        basepath: form.basepath.trim() || undefined,
        desc: form.desc.trim() || undefined,
        project_type: form.project_type,
        ...(form.icon.trim() ? { icon: form.icon.trim() } : {}),
        ...(form.color.trim() ? { color: form.color.trim() } : {}),
      });
      const data = res.data as { _id?: number };
      const id = data?._id;
      if (id) {
        router.push(`/project/${id}/interface/api`);
      } else {
        router.push("/group");
      }
    } catch (err) {
      console.error("创建项目失败", err);
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          新建项目
        </CardTitle>
        <CardDescription>在指定分组下创建 API 项目</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">项目名称</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group_id">所属分组</Label>
            <select
              id="group_id"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.group_id}
              onChange={(e) => setForm((f) => ({ ...f, group_id: e.target.value }))}
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.group_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="basepath">Base Path（可选）</Label>
            <Input
              id="basepath"
              placeholder="/api"
              value={form.basepath}
              onChange={(e) => setForm((f) => ({ ...f, basepath: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">描述</Label>
            <Textarea
              id="desc"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project_type">可见性</Label>
            <select
              id="project_type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.project_type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  project_type: e.target.value as "public" | "private",
                }))
              }
            >
              <option value="private">私有（仅成员可见）</option>
              <option value="public">公开</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="icon">图标（可选）</Label>
              <Input
                id="icon"
                placeholder="如 code"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">主题色（可选）</Label>
              <Input
                id="color"
                placeholder="#2395f1"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="bg-[#2395f1] hover:bg-[#2395f1]/90">
            {loading ? "创建中…" : "创建项目"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
