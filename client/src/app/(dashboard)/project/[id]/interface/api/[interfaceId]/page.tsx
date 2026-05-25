"use client";

/**
 * 项目接口详情页
 */
import { useParams } from "next/navigation";
import { InterfaceApiWorkspace } from "@/components/interface/interface-api-workspace";

export default function ProjectInterfaceDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const interfaceId = Number(params.interfaceId);

  return <InterfaceApiWorkspace projectId={projectId} interfaceId={interfaceId} />;
}
