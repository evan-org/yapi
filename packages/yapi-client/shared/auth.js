import { USER_INFO, USER_TOKEN, USER_ID } from "./config.js";
// 退出登录
export function authLogout() {
  removeToken();
  removeInfo();
  return false;
}
// 设置令牌
export function setToken(payload) {
  return localStorage.setItem(USER_TOKEN, payload);
}
// 获取令牌
export function getToken() {
  return localStorage.getItem(USER_TOKEN);
}
// 设置UID
export function setUserId(payload) {
  return localStorage.setItem(USER_ID, payload);
}
// 获取UID
export function getUserId(payload) {
  return localStorage.getItem(USER_ID, payload);
}
// 保存用户信息
export function setUserInfo(info) {
  localStorage.setItem(USER_INFO, JSON.stringify(info));
}
// 获取当前用户信息
export function getUserInfo() {
  let info = localStorage.getItem(USER_INFO);
  if (info) {
    return JSON.parse(info);
  }
  return {};
}
// 删除用户token
export function removeToken() {
  localStorage.removeItem(USER_TOKEN);
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USER_INFO);
}
// 删除用户信息
export function removeInfo() {
  localStorage.removeItem(USER_INFO);
}
//
