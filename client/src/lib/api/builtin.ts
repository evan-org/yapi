/**
 * 内置业务能力 API（Wiki、统计、导出、高级 Mock、Swagger 同步）
 */
import { apiRequest } from "./client";

export const builtinApi = {
  statisticsCount: () =>
    apiRequest<{
      groupCount: number;
      projectCount: number;
      interfaceCount: number;
      interfaceCaseCount: number;
    }>("/statistics/summary"),

  statisticsMock: () =>
    apiRequest<{ mockCount: number; mockDateList: unknown[] }>(
      "/statistics/mock-log"
    ),

  systemStatus: () =>
    apiRequest<Record<string, unknown>>("/statistics/system"),

  wikiGet: (project_id: number) =>
    apiRequest<{ desc?: string; markdown?: string; username?: string }>(
      `/wiki?project_id=${project_id}`
    ),

  wikiUpdate: (payload: {
    project_id: number;
    desc?: string;
    markdown?: string;
  }) =>
    apiRequest("/wiki", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 导出项目数据 */
  exportData: (type: string, pid: number) =>
    `/api/export/data?type=${type}&pid=${pid}`,

  /** 全量导出（开放接口） */
  exportFullUrl: (pid: number) => `/api/open/export-full?pid=${pid}`,

  /** Swagger2 导出 */
  exportSwagger2Url: (pid: number) =>
    `/api/export/swagger?type=OpenAPIV2&pid=${pid}`,

  swaggerSyncGet: (project_id: number) =>
    apiRequest<{
      _id?: number;
      project_id: number;
      sync_json_url?: string;
      sync_cron?: string;
      sync_mode?: string;
      is_sync_open?: boolean;
    }>(`/swagger-sync?project_id=${project_id}`),

  swaggerSyncSave: (payload: Record<string, unknown>) =>
    apiRequest("/swagger-sync", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advancedMockGet: (interface_id: number) =>
    apiRequest(`/advanced-mock?interface_id=${interface_id}`),

  advancedMockSave: (payload: Record<string, unknown>) =>
    apiRequest("/advanced-mock", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advancedMockCaseList: (interface_id: number) =>
    apiRequest(`/advanced-mock/cases?interface_id=${interface_id}`),

  advancedMockCaseGet: (id: number) =>
    apiRequest(`/advanced-mock/cases/detail?id=${id}`),

  advancedMockCaseSave: (payload: Record<string, unknown>) =>
    apiRequest("/advanced-mock/cases", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advancedMockCaseDel: (id: number) =>
    apiRequest("/advanced-mock/cases/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),

  advancedMockCaseHide: (id: number) =>
    apiRequest("/advanced-mock/cases/hide", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
};
