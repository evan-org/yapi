/**
 * 分组相关 API
 */
import { apiRequest } from "./client";
import type { GroupItem } from "./types";

export const groupApi = {
  myPrivate: () => apiRequest<GroupItem>("/group/get_mygroup"),
  list: () => apiRequest<GroupItem[]>("/group/list"),
  get: (id: number) => apiRequest<GroupItem>(`/group/get?id=${id}`),

  update: (payload: Record<string, unknown>) =>
    apiRequest("/group/up", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMemberList: (id: number) =>
    apiRequest<{ uid: number; username: string; email?: string; role: string }[]>(
      `/group/get_member_list?id=${id}`
    ),

  addMember: (id: number, member_uids: number[], role = "dev") =>
    apiRequest("/group/add_member", {
      method: "POST",
      body: JSON.stringify({ id, member_uids, role }),
    }),

  delMember: (id: number, member_uid: number) =>
    apiRequest("/group/del_member", {
      method: "POST",
      body: JSON.stringify({ id, member_uid }),
    }),

  changeMemberRole: (id: number, member_uid: number, role: string) =>
    apiRequest("/group/change_member_role", {
      method: "POST",
      body: JSON.stringify({ id, member_uid, role }),
    }),
};
