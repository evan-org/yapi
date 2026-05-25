"use client";

/**
 * 接口分类与列表侧栏
 */
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight, FolderOpen, Plus, Trash2 } from "lucide-react";
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
  /** 分类排序 */
  onMoveCat?: (catid: number, direction: "up" | "down") => void;
  /** 接口排序（分类内） */
  onMoveInterface?: (interfaceId: number, catid: number, direction: "up" | "down") => void;
}

export function InterfaceSidebar({
  projectId,
  menu,
  activeId,
  onAddCat,
  onDelCat,
  onMoveCat,
  onMoveInterface,
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
          {menu.map((cat, catIdx) => (
            <div key={cat._id} className="mb-3">
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground">
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                <Link
                  href={`/project/${projectId}/interface/api/cat/${cat._id}`}
                  className="min-w-0 flex-1 truncate hover:text-[#2395f1]"
                  title="表格查看此分类"
                >
                  {cat.name}
                </Link>
                <span className="text-[10px]">({cat.list?.length || 0})</span>
                {onMoveCat ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      disabled={catIdx === 0}
                      title="分类上移"
                      onClick={() => onMoveCat(cat._id, "up")}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      disabled={catIdx === menu.length - 1}
                      title="分类下移"
                      onClick={() => onMoveCat(cat._id, "down")}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </>
                ) : null}
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
                {(cat.list || []).map((item, itemIdx) => {
                  const href = `/project/${projectId}/interface/api/${item._id}`;
                  const active = activeId === item._id;
                  return (
                    <li key={item._id} className="flex items-center gap-0.5">
                      <Link
                        href={href}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-accent",
                          active && "bg-[#2395f1]/10 text-[#2395f1]"
                        )}
                      >
                        <MethodBadge method={item.method} />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                      </Link>
                      {onMoveInterface ? (
                        <div className="flex shrink-0 flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={itemIdx === 0}
                            title="接口上移"
                            onClick={() => onMoveInterface(item._id, cat._id, "up")}
                          >
                            <ArrowUp className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={itemIdx === (cat.list?.length || 0) - 1}
                            title="接口下移"
                            onClick={() => onMoveInterface(item._id, cat._id, "down")}
                          >
                            <ArrowDown className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ) : null}
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
