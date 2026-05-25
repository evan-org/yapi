"use client";

/**
 * 接口分类与列表侧栏
 */
import Link from "next/link";
import { ChevronRight, FolderOpen, Plus, Trash2 } from "lucide-react";
import type { InterfaceCatItem } from "../../lib/api/types";
import { MethodBadge } from "./method-badge";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface InterfaceSidebarProps {
  projectId: number;
  menu: InterfaceCatItem[];
  activeId?: number;
  onAddCat?: () => void;
  /** 删除分类 */
  onDelCat?: (catid: number, name: string) => void;
}

export function InterfaceSidebar({
  projectId,
  menu,
  activeId,
  onAddCat,
  onDelCat,
}: InterfaceSidebarProps) {
  return (
    <aside className="flex w-full flex-col rounded-lg border bg-card md:w-64 md:shrink-0">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">接口列表</span>
        {onAddCat ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddCat} title="新建分类">
            <Plus className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <ScrollArea className="h-[calc(100vh-280px)] min-h-[320px]">
        <div className="p-2">
          {menu.map((cat) => (
            <div key={cat._id} className="mb-3">
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{cat.name}</span>
                <span className="text-[10px]">({cat.list?.length || 0})</span>
                {onDelCat ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    title="删除分类"
                    onClick={() => onDelCat(cat._id, cat.name)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                ) : null}
              </div>
              <ul className="mt-0.5 space-y-0.5">
                {(cat.list || []).map((item) => {
                  const href = `/project/${projectId}/interface/api/${item._id}`;
                  const active = activeId === item._id;
                  return (
                    <li key={item._id}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-accent",
                          active && "bg-[#2395f1]/10 text-[#2395f1]"
                        )}
                      >
                        <MethodBadge method={item.method} />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {menu.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">暂无接口分类</p>
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  );
}
