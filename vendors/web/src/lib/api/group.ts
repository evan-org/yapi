/**
 * 分组相关 API
 */
import { apiRequest } from "./client";
import type { GroupItem } from "./types";

export const groupApi = {
  myPrivate: () => apiRequest<GroupItem>("/group/get_mygroup"),
  list: () => apiRequest<GroupItem[]>("/group/list"),
  get: (id: number) => apiRequest<GroupItem>(`/group/get?id=${id}`),
};
