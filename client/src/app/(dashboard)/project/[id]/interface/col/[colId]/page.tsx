"use client";

/**
 * 测试集合深链：直接打开指定集合
 */
import { useParams } from "next/navigation";
import { ColWorkspace } from "@/components/interface/col-workspace";

export default function ProjectInterfaceColDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const colId = Number(params.colId);

  return <ColWorkspace projectId={projectId} initialColId={colId} />;
}
