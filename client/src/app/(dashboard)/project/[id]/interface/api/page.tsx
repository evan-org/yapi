"use client";

/**
 * 项目接口列表页
 */
import { useParams } from "next/navigation";
import { InterfaceApiWorkspace } from "@/components/interface/interface-api-workspace";

export default function ProjectInterfaceApiPage() {
  const params = useParams();
  const projectId = Number(params.id);

  return <InterfaceApiWorkspace projectId={projectId} />;
}
