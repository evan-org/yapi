"use client";

/**
 * 分组默认页：优先进入「我的分组」，否则第一个可见分组
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
        let targetId: number | null = null;
        try {
          const myRes = await groupApi.myPrivate();
          const my = myRes.data as GroupItem;
          if (my?._id) {
            targetId = my._id;
          }
        } catch (err) {
          console.error("加载我的分组失败，回退到列表", err);
        }

        if (!targetId) {
          const res = await groupApi.list();
          const list = (res.data as GroupItem[]) || [];
          if (list.length > 0) {
            targetId = list[0]._id;
          }
        }

        if (!cancelled) {
          if (targetId) {
            router.replace(`/group/${targetId}`);
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
