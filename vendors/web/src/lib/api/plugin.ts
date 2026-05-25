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
};
