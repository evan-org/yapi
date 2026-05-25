/**
 * 项目相关 API
 */
import { apiRequest } from "./client";
import type { ProjectItem } from "./types";

export const projectApi = {
  listByGroup: (group_id: number) =>
    apiRequest<ProjectItem[]>(`/project/list?group_id=${group_id}`),

  get: (id: number) => apiRequest<ProjectItem>(`/project/get?id=${id}`),

  add: (payload: {
    name: string;
    group_id: number;
    basepath?: string;
    desc?: string;
    project_type?: string;
  }) =>
    apiRequest("/project/add", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (payload: Record<string, unknown>) =>
    apiRequest("/project/up", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getEnv: (project_id: number) =>
    apiRequest<{ env: { name: string; domain: string }[] }>(
      `/project/get_env?project_id=${project_id}`
    ),

  upEnv: (id: number, env: { name: string; domain: string }[]) =>
    apiRequest("/project/up_env", {
      method: "POST",
      body: JSON.stringify({ id, env }),
    }),

  getToken: (project_id: number) =>
    apiRequest<string>(`/project/token?project_id=${project_id}`),

  updateToken: (project_id: number) =>
    apiRequest<string>(`/project/update_token?project_id=${project_id}`),

  getMemberList: (id: number) =>
    apiRequest<{ uid: number; username: string; email?: string; role: string }[]>(
      `/project/get_member_list?id=${id}`
    ),

  addMember: (id: number, member_uids: number[], role = "dev") =>
    apiRequest("/project/add_member", {
      method: "POST",
      body: JSON.stringify({ id, member_uids, role }),
    }),

  delMember: (id: number, member_uid: number) =>
    apiRequest("/project/del_member", {
      method: "POST",
      body: JSON.stringify({ id, member_uid }),
    }),

  changeMemberRole: (id: number, member_uid: number, role: string) =>
    apiRequest("/project/change_member_role", {
      method: "POST",
      body: JSON.stringify({ id, member_uid, role }),
    }),
};
