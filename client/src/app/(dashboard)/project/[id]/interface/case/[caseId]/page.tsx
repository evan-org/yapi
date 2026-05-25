"use client";

/**
 * 测试用例详情页
 */
import { useParams } from "next/navigation";
import { InterfaceModuleTabs } from "@/components/interface/interface-module-tabs";
import { InterfaceCaseDetail } from "@/components/interface/interface-case-detail";

export default function ProjectInterfaceCasePage() {
  const params = useParams();
  const projectId = Number(params.id);
  const caseId = Number(params.caseId);

  return (
    <div>
      <InterfaceModuleTabs />
      <InterfaceCaseDetail projectId={projectId} caseId={caseId} />
    </div>
  );
}
