/**
 * 项目相关 API
 */
import { apiRequest } from "./client";
import type { ProjectItem } from "./types";

export const projectApi = {
  listByGroup: (group_id: number) =>
    apiRequest<ProjectItem[]>(`/project/list?group_id=${group_id}`),

  get: (id: number) => apiRequest<ProjectItem>(`/project/get?id=${id}`),

  add: (payload: {
    name: string;
    group_id: number;
    basepath?: string;
    desc?: string;
    project_type?: string;
  }) =>
    apiRequest("/project/add", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (payload: Record<string, unknown>) =>
    apiRequest("/project/up", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getEnv: (project_id: number) =>
    apiRequest(`/project/get_env?project_id=${project_id}`),
};
