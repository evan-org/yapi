/**
 * 分组模块纯函数（便于单测，不依赖数据库）
 */
export const GROUP_ROLE_LABEL: Record<string, string> = {
  owner: "组长",
  dev: "开发者",
  guest: "访客",
};

export type GroupMemberRole = "owner" | "dev" | "guest";

/**
 * 解析并规范化分组成员角色
 */
export function resolveMemberRole(role: string | undefined): GroupMemberRole {
  const found = (["owner", "dev", "guest"] as const).find((v) => v === role);
  return found || "dev";
}

/**
 * 展示用分组对象：私有空间显示为「个人空间」
 */
export function enrichGroupForDisplay<T extends { type?: string; group_name?: string }>(
  group: T
): T {
  if (group.type === "private") {
    return { ...group, group_name: "个人空间" };
  }
  return group;
}
