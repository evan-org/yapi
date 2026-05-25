"use client";

/**
 * 顶栏：导航、搜索占位、用户菜单（shadcn/ui）
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, PlusCircle, Star, User } from "lucide-react";
import { useAuth } from "../../lib/auth/auth-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "../../lib/utils";

const navItems = [
  { href: "/group", label: "分组" },
  { href: "/follow", label: "关注" },
  { href: "/add-project", label: "新建项目" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initial = user?.username?.slice(0, 1)?.toUpperCase() || "Y";

  return (
    <header className="sticky top-0 z-40 border-b bg-[#32363a] text-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4">
        <Link href="/group" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2395f1] text-sm">
            Y
          </span>
          <span>YAPI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white",
                pathname.startsWith(item.href) && "bg-white/10 text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
            <a
              href="https://hellosean1025.github.io/yapi/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="mr-1 h-4 w-4" />
              文档
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2 text-white hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#2395f1] text-white">{initial}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm md:inline">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/user/profile/${user?._id || ""}`}>
                  <User className="mr-2 h-4 w-4" />
                  个人中心
                </Link>
              </DropdownMenuItem>
              {user?.role === "admin" ? (
                <DropdownMenuItem asChild>
                  <Link href="/user/list">
                    <Star className="mr-2 h-4 w-4" />
                    用户管理
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild>
                <Link href="/add-project">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  新建项目
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                退出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
