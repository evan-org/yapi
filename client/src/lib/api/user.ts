/**
 * 用户 API
 */
import { apiRequest } from "./client";
import type { LoginStatusData, PaginatedList } from "./types";

export interface UserRecord {
  _id: number;
  uid?: number;
  username: string;
  email: string;
  role: string;
  type?: string;
  add_time?: number;
  up_time?: number;
}

export const userApi = {
  status: () => apiRequest<LoginStatusData>("/user/status"),

  login: (email: string, password: string) =>
    apiRequest("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  loginLdap: (email: string, password: string) =>
    apiRequest("/user/login_by_ldap", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => apiRequest("/user/logout"),

  register: (payload: { email: string; password: string; username?: string }) =>
    apiRequest("/user/reg", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: (page = 1, limit = 20) =>
    apiRequest<PaginatedList<UserRecord>>(`/user/list?page=${page}&limit=${limit}`),

  find: (id: number) => apiRequest<UserRecord>(`/user/find?id=${id}`),

  update: (payload: { uid: number; username?: string; email?: string }) =>
    apiRequest("/user/update", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: { uid: number; password: string; old_password?: string }) =>
    apiRequest("/user/change_password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  del: (id: number) =>
    apiRequest("/user/del", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),

  search: (q: string) => apiRequest<UserRecord[]>(`/user/search?q=${encodeURIComponent(q)}`),

  /** 按类型解析导航目标 */
  resolve: (type: "interface" | "project" | "group", id: number) =>
    apiRequest(`/user/project?type=${type}&id=${id}`),
};
