"use client";

/**
 * 分组详情：项目列表 / 成员 / 设置（Tab）
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Activity, FolderKanban, Settings, Star, Users } from "lucide-react";
import { ActivityLogPanel } from "../../../../components/shared/activity-log-panel";
import { groupApi, projectApi } from "../../../../lib/api/client";
import { followApi } from "../../../../lib/api/follow";
import type { GroupItem, MemberItem, ProjectItem } from "../../../../lib/api/types";
import { MemberPanel } from "../../../../components/shared/member-panel";
import { GroupSidebar } from "../../../../components/group/group-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../components/ui/alert";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = Number(params.groupId);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [current, setCurrent] = useState<GroupItem | null>(null);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [settingsForm, setSettingsForm] = useState({ group_name: "", group_desc: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [groupRes, projectRes] = await Promise.all([
        groupApi.list(),
        projectApi.listByGroup(groupId),
      ]);
      const list = (groupRes.data as GroupItem[]) || [];
      setGroups(list);
      setCurrent(list.find((g) => g._id === groupId) || null);
      const projData = projectRes.data;
      setProjects(Array.isArray(projData) ? (projData as ProjectItem[]) : []);
      const g = list.find((item) => item._id === groupId);
      if (g) {
        setSettingsForm({
          group_name: g.group_name || "",
          group_desc: g.group_desc || "",
        });
      }
      if (g?.type === "public") {
        const memberRes = await groupApi.getMemberList(groupId);
        setMembers((memberRes.data as MemberItem[]) || []);
      }
    } catch (err) {
      console.error("分组页加载失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [groupId]);

  useEffect(() => {
    if (!Number.isNaN(groupId)) {
      load();
    }
  }, [groupId, load]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <GroupSidebar groups={groups} />
      <div className="min-w-0 flex-1">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">{current?.group_name || "分组"}</h1>
          {current?.group_desc ? (
            <p className="text-sm text-muted-foreground">{current.group_desc}</p>
          ) : null}
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">
              <FolderKanban className="mr-2 h-4 w-4" />
              项目列表
            </TabsTrigger>
            {current?.type === "public" ? (
              <TabsTrigger value="members">
                <Users className="mr-2 h-4 w-4" />
                成员列表
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              动态
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              分组设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Card
                  key={p._id}
                  className="transition hover:border-[#2395f1]/50 hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/project/${p._id}/interface/api`}
                        className="min-w-0 flex-1 hover:text-[#2395f1]"
                      >
                        <CardTitle className="text-base">{p.name}</CardTitle>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1">
                        {p.color ? (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="关注项目"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await followApi.add(p._id);
                              console.log("已关注项目", p._id);
                            } catch (err) {
                              console.error("关注失败", err);
                            }
                          }}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                      <CardDescription className="line-clamp-2">
                        {p.desc || "暂无描述"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/project/${p._id}/interface/api`}>
                        <Badge variant="secondary">{p.project_type || "private"}</Badge>
                      </Link>
                    </CardContent>
                  </Card>
              ))}
              {projects.length === 0 ? (
                <Card className="col-span-full border-dashed">
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    该分组下暂无项目，
                    <Button variant="link" className="px-1" asChild>
                      <Link href="/add-project">去新建</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <MemberPanel
                  title="分组成员"
                  members={members}
                  onReload={load}
                  onAdd={async (uids, role) => {
                    await groupApi.addMember(groupId, uids, role);
                  }}
                  onRemove={async (uid) => {
                    await groupApi.delMember(groupId, uid);
                  }}
                  onChangeRole={async (uid, role) => {
                    await groupApi.changeMemberRole(groupId, uid, role);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>分组动态</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityLogPanel type="group" typeid={groupId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>分组设置</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="max-w-md space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingSettings(true);
                    try {
                      await groupApi.update({
                        id: groupId,
                        group_name: settingsForm.group_name,
                        group_desc: settingsForm.group_desc,
                      });
                      await load();
                      console.log("分组设置已保存", groupId);
                    } catch (err) {
                      console.error("保存分组失败", err);
                      setError(err instanceof Error ? err.message : "保存失败");
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">分组名称</label>
                    <input
                      className="flex h-9 w-full rounded-md border px-3 text-sm"
                      value={settingsForm.group_name}
                      onChange={(e) =>
                        setSettingsForm((f) => ({ ...f, group_name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">分组描述</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                      value={settingsForm.group_desc}
                      onChange={(e) =>
                        setSettingsForm((f) => ({ ...f, group_desc: e.target.value }))
                      }
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={savingSettings}>
                    {savingSettings ? "保存中…" : "保存"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
