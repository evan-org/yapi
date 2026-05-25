/**
 * 内置扩展能力 API（/api/extensions/*）
 */
import { apiRequest } from "./client";

const EXT = "/extensions";

export const extensionsApi = {
  statisticsCount: () =>
    apiRequest<{
      groupCount: number;
      projectCount: number;
      interfaceCount: number;
      interfaceCaseCount: number;
    }>(`${EXT}/statistics/summary`),

  statisticsMock: () =>
    apiRequest<{ mockCount: number; mockDateList: unknown[] }>(
      `${EXT}/statistics/mock-log`
    ),

  systemStatus: () =>
    apiRequest<Record<string, unknown>>(`${EXT}/statistics/system`),

  wikiGet: (project_id: number) =>
    apiRequest<{ desc?: string; markdown?: string; username?: string }>(
      `${EXT}/wiki?project_id=${project_id}`
    ),

  wikiUpdate: (payload: {
    project_id: number;
    desc?: string;
    markdown?: string;
  }) =>
    apiRequest(`${EXT}/wiki`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 导出项目数据 */
  exportData: (type: string, pid: number) =>
    `/api${EXT}/export/data?type=${type}&pid=${pid}`,

  /** 全量导出（开放接口） */
  exportFullUrl: (pid: number) => `/api/open${EXT}/export-full?pid=${pid}`,

  /** Swagger2 导出 */
  exportSwagger2Url: (pid: number) =>
    `/api${EXT}/export/swagger?type=OpenAPIV2&pid=${pid}`,

  autoSyncGet: (project_id: number) =>
    apiRequest<{
      _id?: number;
      project_id: number;
      sync_json_url?: string;
      sync_cron?: string;
      sync_mode?: string;
      is_sync_open?: boolean;
    }>(`${EXT}/swagger-sync?project_id=${project_id}`),

  autoSyncSave: (payload: Record<string, unknown>) =>
    apiRequest(`${EXT}/swagger-sync`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advMockGet: (interface_id: number) =>
    apiRequest(`${EXT}/advanced-mock?interface_id=${interface_id}`),

  advMockSave: (payload: Record<string, unknown>) =>
    apiRequest(`${EXT}/advanced-mock`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advMockCaseList: (interface_id: number) =>
    apiRequest(`${EXT}/advanced-mock/cases?interface_id=${interface_id}`),

  advMockCaseGet: (id: number) =>
    apiRequest(`${EXT}/advanced-mock/cases/detail?id=${id}`),

  advMockCaseSave: (payload: Record<string, unknown>) =>
    apiRequest(`${EXT}/advanced-mock/cases`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advMockCaseDel: (id: number) =>
    apiRequest(`${EXT}/advanced-mock/cases/delete`, {
      method: "POST",
      body: JSON.stringify({ id }),
    }),

  advMockCaseHide: (id: number) =>
    apiRequest(`${EXT}/advanced-mock/cases/hide`, {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
};
