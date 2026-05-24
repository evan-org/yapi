/**
 * 动态 / 日志 API
 */
import apiClient from "../utils/apiClient";

export function fetchLogList(params) {
  return apiClient.get("/log/list", { params });
}

export function fetchLogListByUpdate(params) {
  return apiClient.post("/log/list_by_update", params);
}
