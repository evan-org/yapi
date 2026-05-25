"use client";

/**
 * 分组侧栏：列表与切换
 */
import Link from "next/link";
import { useParams } from "next/navigation";
import { Folder, Lock, Users } from "lucide-react";
import type { GroupItem } from "../../lib/api/types";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface GroupSidebarProps {
  groups: GroupItem[];
}

export function GroupSidebar({ groups }: GroupSidebarProps) {
  const params = useParams();
  const activeId = params?.groupId ? String(params.groupId) : String(groups[0]?._id || "");

  return (
    <aside className="flex w-full flex-col rounded-lg border bg-card shadow-sm md:w-72 md:shrink-0">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">我的分组</h2>
        <p className="text-xs text-muted-foreground">选择分组管理项目</p>
      </div>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <ul className="p-2">
          {groups.map((g) => {
            const href = `/group/${g._id}`;
            const active = String(g._id) === activeId;
            return (
              <li key={g._id}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-start gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent",
                    active && "bg-[#2395f1]/10 text-[#2395f1]"
                  )}
                >
                  {g.type === "private" ? (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                  ) : (
                    <Users className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                  )}
                  <span className="flex-1">
                    <span className="font-medium">{g.group_name}</span>
                    {g.group_desc ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                        {g.group_desc}
                      </span>
                    ) : null}
                  </span>
                  {g.type === "public" ? (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      公开
                    </Badge>
                  ) : null}
                </Link>
              </li>
            );
          })}
          {groups.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              <Folder className="mx-auto mb-2 h-8 w-8 opacity-40" />
              暂无分组
            </li>
          ) : null}
        </ul>
      </ScrollArea>
    </aside>
  );
}
