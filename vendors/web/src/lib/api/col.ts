/**
 * 测试集合 API
 */
import { apiRequest } from "./client";
import type { InterfaceColItem } from "./types";

export const colApi = {
  list: (project_id: number) =>
    apiRequest<InterfaceColItem[]>(`/col/list?project_id=${project_id}`),

  addCol: (payload: { project_id: number; name: string; desc?: string }) =>
    apiRequest("/col/add_col", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  delCol: (id: number) => apiRequest(`/col/del_col?id=${id}`),

  addCaseList: (payload: {
    project_id: number;
    col_id: number;
    interface_list: number[];
  }) =>
    apiRequest("/col/add_case_list", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCaseList: (col_id: number) =>
    apiRequest(`/col/case_list?col_id=${col_id}`),

  getCase: (caseid: number) => apiRequest(`/col/case?caseid=${caseid}`),

  upCase: (payload: Record<string, unknown>) =>
    apiRequest("/col/up_case", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  upCol: (payload: { col_id: number; name?: string; desc?: string }) =>
    apiRequest("/col/up_col", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
