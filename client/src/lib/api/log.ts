/**
 * 项目/分组动态 API
 */
import { apiRequest } from "./client";
import type { LogItem, PaginatedList } from "./types";

export const logApi = {
  list: (params: { type: "project" | "group"; typeid: number; page?: number; limit?: number }) => {
    const q = new URLSearchParams({
      type: params.type,
      typeid: String(params.typeid),
      page: String(params.page || 1),
      limit: String(params.limit || 20),
    });
    return apiRequest<PaginatedList<LogItem>>(`/log/list?${q.toString()}`);
  },
};
