"use client";

/**
 * 接口模块子导航：接口列表 / 测试集合
 */
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

export function InterfaceModuleTabs() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id;

  const tabs = [
    { key: "api", label: "接口", href: `/project/${projectId}/interface/api` },
    { key: "col", label: "测试集合", href: `/project/${projectId}/interface/col` },
  ];

  return (
    <div className="mb-4 flex gap-2 border-b pb-2">
      {tabs.map((tab) => {
        const active =
          tab.key === "api"
            ? pathname.includes("/interface/api")
            : pathname.includes("/interface/col") || pathname.includes("/interface/case");
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition hover:bg-accent",
              active && "bg-[#2395f1]/10 font-medium text-[#2395f1]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
