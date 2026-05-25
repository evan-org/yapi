/**
 * 接口管理相关 API
 */
import { apiRequest, apiRequestRaw } from "./client";
import type { InterfaceCatItem, InterfaceDetail, InterfaceListItem, PaginatedList } from "./types";

export const interfaceApi = {
  /** 分类 + 接口树（侧栏菜单） */
  listMenu: (project_id: number) =>
    apiRequest<InterfaceCatItem[]>(`/interface/list_menu?project_id=${project_id}`),

  /** 接口详情 */
  get: (id: number) => apiRequest<InterfaceDetail>(`/interface/get?id=${id}`),

  /** 更新接口 */
  update: (payload: Record<string, unknown>) =>
    apiRequest("/interface/up", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 新增分类 */
  addCat: (payload: { project_id: number; name: string; desc?: string }) =>
    apiRequest("/interface/add_cat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 新增接口 */
  add: (payload: Record<string, unknown>) =>
    apiRequest("/interface/add", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 删除接口 */
  del: (id: number) =>
    apiRequest("/interface/del", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),

  delCat: (catid: number) =>
    apiRequest("/interface/del_cat", {
      method: "POST",
      body: JSON.stringify({ catid }),
    }),

  upCat: (payload: { catid: number; name: string; desc?: string }) =>
    apiRequest("/interface/up_cat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 分页接口列表（表格模式） */
  list: (
    project_id: number,
    opts?: { page?: number; limit?: number; status?: string; tag?: string }
  ) => {
    const q = new URLSearchParams({
      project_id: String(project_id),
      page: String(opts?.page ?? 1),
      limit: String(opts?.limit ?? 20),
    });
    if (opts?.status) q.set("status", opts.status);
    if (opts?.tag) q.set("tag", opts.tag);
    return apiRequest<PaginatedList<InterfaceListItem>>(`/interface/list?${q.toString()}`);
  },

  /** 按分类分页列表 */
  listByCat: (
    catid: number,
    opts?: { page?: number; limit?: number; status?: string }
  ) => {
    const q = new URLSearchParams({
      catid: String(catid),
      page: String(opts?.page ?? 1),
      limit: String(opts?.limit ?? 20),
    });
    if (opts?.status) q.set("status", opts.status);
    return apiRequest<PaginatedList<InterfaceListItem>>(`/interface/list_cat?${q.toString()}`);
  },

  /** JSON Schema 转示例 JSON（原始响应，非信封） */
  schema2json: (schema: unknown, required?: boolean) =>
    apiRequestRaw<Record<string, unknown>>("/interface/schema2json", {
      method: "POST",
      body: JSON.stringify({ schema, required }),
    }),
};
