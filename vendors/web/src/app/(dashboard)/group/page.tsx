"use client";

/**
 * 分组默认页：重定向到第一个分组
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { groupApi } from "../../../lib/api/client";
import type { GroupItem } from "../../../lib/api/types";

export default function GroupIndexPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await groupApi.list();
        const list = (res.data as GroupItem[]) || [];
        if (!cancelled) {
          if (list.length > 0) {
            router.replace(`/group/${list[0]._id}`);
          } else {
            setError("暂无分组，请联系管理员创建");
          }
        }
      } catch (err) {
        console.error("加载分组失败", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      {error || "正在进入分组…"}
    </div>
  );
}
