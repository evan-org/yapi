/**
 * 开放接口：数据导入等（需项目 token）
 */
import { apiRequest } from "./client";

export const openApi = {
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
