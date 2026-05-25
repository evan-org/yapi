"use client";

/**
 * 分组详情：项目列表 / 成员 / 设置（Tab）
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Settings, Users } from "lucide-react";
import { groupApi, projectApi } from "../../../../lib/api/client";
import type { GroupItem, ProjectItem } from "../../../../lib/api/types";
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
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              分组设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link key={p._id} href={`/project/${p._id}/interface/api`}>
                  <Card className="transition hover:border-[#2395f1]/50 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        {p.color ? (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        ) : null}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {p.desc || "暂无描述"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">{p.project_type || "private"}</Badge>
                    </CardContent>
                  </Card>
                </Link>
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
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                成员管理将在后续迭代迁移；当前可使用旧版客户端完整功能。
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                分组设置迁移中。分组 ID：{groupId}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
