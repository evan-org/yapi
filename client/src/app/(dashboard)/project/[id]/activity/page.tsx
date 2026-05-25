"use client";

/**
 * 项目动态
 */
import { useParams } from "next/navigation";
import { ActivityLogPanel } from "@/components/shared/activity-log-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectActivityPage() {
  const params = useParams();
  const projectId = Number(params.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>项目动态</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityLogPanel type="project" typeid={projectId} />
      </CardContent>
    </Card>
  );
}
