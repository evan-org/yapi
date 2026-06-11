"use client";

/**
 * 按分类查看接口表格列表
 */
import { useParams } from "next/navigation";
import { InterfaceModuleTabs } from "@/components/interface/interface-module-tabs";
import { InterfaceListTable } from "@/components/interface/interface-list-table";

export default function ProjectInterfaceCatListPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const catId = Number(params.catId);

  return (
    <div>
      <InterfaceModuleTabs />
      <p className="mb-3 text-sm text-muted-foreground">分类 #{catId} 下的接口</p>
      <InterfaceListTable projectId={projectId} catId={catId} />
    </div>
  );
}
