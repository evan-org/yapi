"use client";

/**
 * 成员列表：添加、删除、改角色
 */
import { useCallback, useEffect, useState } from "react";
import { userApi, type UserRecord } from "../../lib/api/user";
import type { MemberItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface MemberPanelProps {
  title: string;
  members: MemberItem[];
  onReload: () => void;
  onAdd: (uids: number[], role: string) => Promise<void>;
  onRemove: (uid: number) => Promise<void>;
  onChangeRole?: (uid: number, role: string) => Promise<void>;
}

export function MemberPanel({
  title,
  members,
  onReload,
  onAdd,
  onRemove,
  onChangeRole,
}: MemberPanelProps) {
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<UserRecord[]>([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("dev");

  const doSearch = useCallback(async () => {
    if (!searchQ.trim()) return;
    try {
      const res = await userApi.search(searchQ.trim());
      setSearchHits((res.data as UserRecord[]) || []);
    } catch (err) {
      console.error("搜索用户失败", err);
    }
  }, [searchQ]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQ.trim().length >= 2) {
        doSearch();
      } else {
        setSearchHits([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ, doSearch]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">用户</th>
              <th className="px-3 py-2 text-left">角色</th>
              <th className="px-3 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.uid} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium">{m.username}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </td>
                <td className="px-3 py-2">
                  {onChangeRole ? (
                    <select
                      className="h-8 rounded border px-2 text-xs"
                      value={m.role}
                      onChange={async (e) => {
                        try {
                          await onChangeRole(m.uid, e.target.value);
                          onReload();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "更新失败");
                        }
                      }}
                    >
                      <option value="owner">owner</option>
                      <option value="dev">dev</option>
                      <option value="guest">guest</option>
                    </select>
                  ) : (
                    m.role
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await onRemove(m.uid);
                        onReload();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "删除失败");
                      }
                    }}
                  >
                    移除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">暂无成员</p>
        ) : null}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <Label>添加成员（搜索用户名或邮箱）</Label>
        <Input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="输入关键字搜索"
        />
        {searchHits.length > 0 ? (
          <ul className="max-h-32 overflow-auto rounded border text-sm">
            {searchHits.map((u) => (
              <li
                key={u.uid || u._id}
                className="flex cursor-pointer items-center justify-between border-b px-3 py-2 last:border-0 hover:bg-accent"
                onClick={async () => {
                  try {
                    const uid = u.uid || u._id;
                    await onAdd([uid], role);
                    setSearchQ("");
                    setSearchHits([]);
                    onReload();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "添加失败");
                  }
                }}
              >
                <span>
                  {u.username} ({u.email})
                </span>
                <span className="text-xs text-[#2395f1]">添加</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex items-center gap-2">
          <Label className="text-xs">角色</Label>
          <select
            className="h-8 rounded border px-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="dev">dev</option>
            <option value="guest">guest</option>
            <option value="owner">owner</option>
          </select>
        </div>
      </div>
    </div>
  );
}
