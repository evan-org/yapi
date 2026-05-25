/**
 * 开放接口：数据导入等（需项目 token）
 */
import { apiRequest } from "./client";

export const openApi = {
  /** 服务端自动化测试 URL（需项目 token） */
  runAutoTestUrl: (colId: number, token: string, mode = "json") =>
    `/api/open/run_auto_test?id=${colId}&token=${encodeURIComponent(token)}&mode=${mode}`,

  importData: (payload: {
    type: string;
    token: string;
    json: string;
    project_id: number;
    merge?: string;
    url?: string;
  }) =>
    apiRequest("/open/import_data", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
