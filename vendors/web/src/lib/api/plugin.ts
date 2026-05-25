/**
 * 插件扩展 API（/api/plugin/*）
 */
import { apiRequest } from "./client";

export const pluginApi = {
  statisticsCount: () =>
    apiRequest<{
      groupCount: number;
      projectCount: number;
      interfaceCount: number;
      interfaceCaseCount: number;
    }>("/plugin/statismock/count"),

  statisticsMock: () =>
    apiRequest<{ mockCount: number; mockDateList: unknown[] }>("/plugin/statismock/get"),

  systemStatus: () =>
    apiRequest<Record<string, unknown>>("/plugin/statismock/get_system_status"),

  wikiGet: (project_id: number) =>
    apiRequest<{ desc?: string; markdown?: string; username?: string }>(
      `/plugin/wiki_desc/get?project_id=${project_id}`
    ),

  wikiUpdate: (payload: {
    project_id: number;
    desc?: string;
    markdown?: string;
  }) =>
    apiRequest("/plugin/wiki_desc/up", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 导出项目数据 */
  exportData: (type: string, pid: number) =>
    `/api/plugin/export?type=${type}&pid=${pid}`,

  /** 全量导出（开放接口） */
  exportFullUrl: (pid: number) => `/api/open/plugin/export-full?pid=${pid}`,

  /** Swagger2 导出 */
  exportSwagger2Url: (pid: number) =>
    `/api/plugin/exportSwagger?type=OpenAPIV2&pid=${pid}`,

  autoSyncGet: (project_id: number) =>
    apiRequest<{
      _id?: number;
      project_id: number;
      sync_json_url?: string;
      sync_cron?: string;
      sync_mode?: string;
      is_sync_open?: boolean;
    }>(`/plugin/autoSync/get?project_id=${project_id}`),

  autoSyncSave: (payload: Record<string, unknown>) =>
    apiRequest("/plugin/autoSync/save", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advMockGet: (interface_id: number) =>
    apiRequest(`/plugin/advmock/get?interface_id=${interface_id}`),

  advMockSave: (payload: Record<string, unknown>) =>
    apiRequest("/plugin/advmock/save", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  advMockCaseList: (interface_id: number) =>
    apiRequest(`/plugin/advmock/case/list?interface_id=${interface_id}`),
};
