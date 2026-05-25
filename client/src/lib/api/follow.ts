/**
 * 关注项目 API
 */
import { apiRequest } from "./client";
import type { FollowItem } from "./types";

export const followApi = {
  list: () => apiRequest<{ list: FollowItem[] }>("/follow/list"),

  add: (projectid: number) =>
    apiRequest("/follow/add", {
      method: "POST",
      body: JSON.stringify({ projectid }),
    }),

  del: (projectid: number) =>
    apiRequest("/follow/del", {
      method: "POST",
      body: JSON.stringify({ projectid }),
    }),
};
