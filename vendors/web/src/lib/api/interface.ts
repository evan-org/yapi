/**
 * 接口管理相关 API
 */
import { apiRequest } from "./client";
import type { InterfaceCatItem, InterfaceDetail } from "./types";

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
};
