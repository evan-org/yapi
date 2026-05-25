"use client";

/**
 * 顶栏全局搜索：数字 ID 解析、项目/接口/分组关键词搜索、用户搜索
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { ApiCode } from "../../lib/api/types";
import { projectApi } from "../../lib/api/project";
import { userApi } from "../../lib/api/user";
import { Input } from "../ui/input";

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    setLoading(true);
    try {
      const numId = Number(keyword);
      if (!Number.isNaN(numId) && numId > 0) {
        const ifaceRes = await userApi.resolve("interface", numId);
        if (ifaceRes.errcode === ApiCode.SUCCESS) {
          const data = ifaceRes.data as {
            interface?: { _id: number };
            project?: { _id: number };
          };
          if (data?.project?._id && data?.interface?._id) {
            router.push(
              `/project/${data.project._id}/interface/api/${data.interface._id}`
            );
            return;
          }
        }
        const projRes = await userApi.resolve("project", numId);
        if (projRes.errcode === ApiCode.SUCCESS) {
          const data = projRes.data as { project?: { _id: number } };
          if (data?.project?._id) {
            router.push(`/project/${data.project._id}/interface/api`);
            return;
          }
        }
        const groupRes = await userApi.resolve("group", numId);
        if (groupRes.errcode === ApiCode.SUCCESS) {
          const data = groupRes.data as { group?: { _id: number } };
          if (data?.group?._id) {
            router.push(`/group/${data.group._id}`);
            return;
          }
        }
      }

      const projSearch = await projectApi.search(keyword);
      if (projSearch.errcode === ApiCode.SUCCESS && projSearch.data) {
        const { project, group, interface: ifaceList } = projSearch.data;
        if (ifaceList?.length) {
          router.push(
            `/project/${ifaceList[0].projectId}/interface/api/${ifaceList[0]._id}`
          );
          return;
        }
        if (project?.length) {
          router.push(`/project/${project[0]._id}/interface/api`);
          return;
        }
        if (group?.length) {
          router.push(`/group/${group[0]._id}`);
          return;
        }
      }

      const res = await userApi.search(keyword);
      const hits = (res.data as { uid?: number; _id?: number; username: string }[]) || [];
      if (hits.length === 1) {
        const uid = hits[0].uid || hits[0]._id;
        router.push(`/user/profile/${uid}`);
        return;
      }
      console.log("搜索无精确匹配", keyword, hits);
    } catch (err) {
      console.error("搜索失败", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative hidden max-w-xs flex-1 md:block">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
      <Input
        className="h-9 border-white/20 bg-white/10 pl-8 text-white placeholder:text-white/50"
        placeholder="ID / 项目 / 接口 / 用户…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={loading}
      />
    </form>
  );
}
