"use client";

/**
 * 项目布局：侧栏导航（接口 / 测试 / 设置等）
 */
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Activity, Database, FileCode, Settings, Users } from "lucide-react";
import { cn } from "../../../../lib/utils";

const nav = [
  { segment: "interface/api", label: "接口", icon: FileCode },
  { segment: "interface/col", label: "测试集合", icon: Database },
  { segment: "activity", label: "动态", icon: Activity },
  { segment: "members", label: "成员", icon: Users },
  { segment: "setting", label: "设置", icon: Settings },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 rounded-lg border bg-card p-3 lg:w-52">
        <p className="mb-3 px-2 text-xs font-medium text-muted-foreground">项目 #{projectId}</p>
        <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {nav.map((item) => {
            const href = `/project/${projectId}/${item.segment}`;
            const active = pathname.includes(item.segment);
            const Icon = item.icon;
            return (
              <Link
                key={item.segment}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent",
                  active && "bg-[#2395f1]/10 font-medium text-[#2395f1]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
