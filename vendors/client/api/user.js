/**
 * 用户相关 API（路径相对 baseURL /api）
 */
import apiClient from "../utils/apiClient";

export function fetchLoginStatus() {
  return apiClient.get("/user/status");
}

export function login(data) {
  return apiClient.post("/user/login", data);
}

export function loginByLdap(data) {
  return apiClient.post("/user/login_by_ldap", data);
}

export function register(param) {
  return apiClient.post("/user/reg", param);
}

export function logout() {
  return apiClient.get("/user/logout");
}

export function finishStudy() {
  return apiClient.get("/user/up_study");
}

export function searchUser(params) {
  return apiClient.get("/user/search", { params });
}

export function fetchUserList(page, limit) {
  return apiClient.get("/user/list", { params: { page, limit } });
}

export function fetchUser(id) {
  return apiClient.get("/user/find", { params: { id } });
}

export function updateUser(params) {
  return apiClient.post("/user/update", params);
}

export function changePassword(params) {
  return apiClient.post("/user/change_password", params);
}
