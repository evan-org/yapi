import { USER_INFO, USER_TOKEN } from "@/config/index.ts";
import {
  authAction_address,
  authAction_hasLogin,
  authAction_patient,
  authAction_token,
  authAction_userInfo
} from "@/store/action/authAction"
// 退出登录
export function authLogout() {
  removeToken();
  removeInfo();
  return false;
}
//
//
// 获取令牌
export function getToken() {
  return localStorage.getItem(USER_TOKEN);
}
// 获取当前用户信息
export function getUserInfo() {
  let info = localStorage.getItem(USER_INFO);
  if (info) {
    return JSON.parse(info);
  }
  return {};
}
//
//
// 设置令牌
export function setToken(payload) {
  return localStorage.setItem(USER_TOKEN, payload);
}
// 保存用户信息
export function saveUserInfo(info) {
  localStorage.setItem(USER_INFO, JSON.stringify(info));
}
//
//
// 删除用户token
export function removeToken() {
  localStorage.removeItem(USER_TOKEN);
  localStorage.removeItem(USER_INFO);
  authAction_hasLogin(false);
  authAction_token(null);
}
// 删除用户信息
export function removeInfo() {
  localStorage.removeItem(USER_INFO);
  authAction_userInfo(null);
}
//
