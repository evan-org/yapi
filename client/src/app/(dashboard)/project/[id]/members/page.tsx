"use client";

/**
 * 项目成员管理
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { projectApi } from "@/lib/api/project";
import type { MemberItem } from "@/lib/api/types";
import { MemberPanel } from "@/components/shared/member-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await projectApi.getMemberList(projectId);
      setMembers((res.data as MemberItem[]) || []);
    } catch (err) {
      console.error("加载项目成员失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>项目成员</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <MemberPanel
          title="成员列表"
          members={members}
          onReload={load}
          onAdd={async (uids, role) => {
            await projectApi.addMember(projectId, uids, role);
          }}
          onRemove={async (uid) => {
            await projectApi.delMember(projectId, uid);
          }}
          onChangeRole={async (uid, role) => {
            await projectApi.changeMemberRole(projectId, uid, role);
          }}
        />
      </CardContent>
    </Card>
  );
}
