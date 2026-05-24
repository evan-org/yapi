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
