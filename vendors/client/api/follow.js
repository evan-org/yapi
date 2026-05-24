/**
 * 关注相关 API
 */
import apiClient from "../utils/apiClient";

export function fetchFollowList(uid) {
  return apiClient.get("/follow/list", { params: { uid } });
}

export function addFollow(param) {
  return apiClient.post("/follow/add", param);
}

export function removeFollow(projectid) {
  return apiClient.post("/follow/del", { projectid });
}
