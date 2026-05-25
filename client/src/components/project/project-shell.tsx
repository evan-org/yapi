"use client";

/**
 * 项目布局壳：加载项目信息、面包屑、侧栏导航
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Database,
  FileCode,
  FlaskConical,
  Settings,
  Users,
} from "lucide-react";
import { projectApi, groupApi } from "../../lib/api/client";
import type { ProjectItem, GroupItem } from "../../lib/api/types";
import { cn } from "../../lib/utils";

const nav = [
  { segment: "interface/api", label: "接口", icon: FileCode },
  { segment: "interface/col", label: "测试集合", icon: Database },
  { segment: "interface/case", label: "测试用例", icon: FlaskConical, match: "/interface/case" },
  { segment: "wiki", label: "Wiki", icon: BookOpen },
  { segment: "activity", label: "动态", icon: Activity },
  { segment: "members", label: "成员", icon: Users },
  { segment: "setting", label: "设置", icon: Settings },
];

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = Number(params.id);
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [group, setGroup] = useState<GroupItem | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await projectApi.get(projectId);
      const p = res.data as ProjectItem;
      setProject(p);
      if (p.group_id) {
        const gRes = await groupApi.get(p.group_id);
        setGroup(gRes.data as GroupItem);
      }
    } catch (err) {
      console.error("加载项目信息失败", err);
    }
  }, [projectId]);

  useEffect(() => {
    if (!Number.isNaN(projectId)) {
      load();
    }
  }, [projectId, load]);

  return (
    <div className="flex flex-col gap-4">
      <nav className="text-sm text-muted-foreground">
        <Link href="/group" className="hover:text-[#2395f1]">
          分组
        </Link>
        {group ? (
          <>
            <span className="mx-2">/</span>
            <Link href={`/group/${group._id}`} className="hover:text-[#2395f1]">
              {group.group_name}
            </Link>
          </>
        ) : null}
        <span className="mx-2">/</span>
        <span className="text-foreground">{project?.name || `项目 ${projectId}`}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 rounded-lg border bg-card p-3 lg:w-56">
          {project?.desc ? (
            <p className="mb-3 px-2 text-xs text-muted-foreground line-clamp-2">{project.desc}</p>
          ) : null}
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
            {nav.map((item) => {
              const href =
                item.segment === "interface/case"
                  ? `/project/${projectId}/interface/col`
                  : `/project/${projectId}/${item.segment}`;
              const active =
                item.match && "match" in item
                  ? pathname.includes(item.match)
                  : pathname.includes(item.segment);
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
    </div>
  );
}
