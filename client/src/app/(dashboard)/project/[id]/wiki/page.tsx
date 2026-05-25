"use client";

/**
 * 项目 Wiki 页
 */
import { useParams } from "next/navigation";
import { ProjectWikiPanel } from "@/components/project/project-wiki-panel";

export default function ProjectWikiPage() {
  const params = useParams();
  const projectId = Number(params.id);

  return <ProjectWikiPanel projectId={projectId} />;
}
