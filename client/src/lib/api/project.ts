/**
 * 项目相关 API
 */
import { apiRequest } from "./client";
import type {
  ProjectEnvItem,
  ProjectItem,
  ProjectScriptsPayload,
  ProjectSearchResult,
} from "./types";

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
    apiRequest<{ env: ProjectEnvItem[] }>(
      `/project/get_env?project_id=${project_id}`
    ),

  upEnv: (id: number, env: ProjectEnvItem[]) =>
    apiRequest("/project/up_env", {
      method: "POST",
      body: JSON.stringify({ id, env }),
    }),

  /** 更新项目级 pre/after/mock 脚本 */
  upScripts: (payload: { id: number } & ProjectScriptsPayload) =>
    apiRequest("/project/up", {
      method: "POST",
      body: JSON.stringify(payload),
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

  upTag: (id: number, tag: { name: string; desc?: string }[]) =>
    apiRequest("/project/up_tag", {
      method: "POST",
      body: JSON.stringify({ id, tag }),
    }),

  /** 模糊搜索项目 / 分组 / 接口 */
  search: (q: string) =>
    apiRequest<ProjectSearchResult>(`/project/search?q=${encodeURIComponent(q)}`),

  /** 删除项目（级联接口与测试集） */
  del: (id: number) =>
    apiRequest("/project/del", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),

  /**
   * 复制项目（需传入 get 返回的完整数据，含 cat 分类树）
   */
  copy: (payload: Record<string, unknown>) =>
    apiRequest<ProjectItem>("/project/copy", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 服务端拉取 Swagger JSON（代理，避免浏览器跨域） */
  swaggerUrl: (url: string) =>
    apiRequest<unknown>(`/project/swagger_url?url=${encodeURIComponent(url)}`),

  /** 成员邮件通知开关 */
  changeMemberEmailNotice: (
    id: number,
    member_uid: number,
    email_notice: boolean
  ) =>
    apiRequest("/project/change_member_email_notice", {
      method: "POST",
      body: JSON.stringify({ id, member_uid, email_notice }),
    }),
};
