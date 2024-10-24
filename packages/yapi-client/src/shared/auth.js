"use client"
import Cookie from "js-cookie";
import { Base64 } from "js-base64";
import { USER_INFO, USER_TOKEN, USER_ID, TOKEN_EXPIRE } from "@/shared/config.js";

// 设置令牌
export function setToken(payload = "") {
  Cookie.set(Base64.encode(USER_TOKEN), Base64.encode(payload), { expires: TOKEN_EXPIRE, path: "/" });
  return localStorage.setItem(Base64.encode(USER_TOKEN), Base64.encode(payload));
}
// 获取令牌
export function getToken() {
  return Base64.decode(localStorage.getItem(Base64.encode(USER_TOKEN)));
}
// 设置UID
export function setUserId(payload = "") {
  return localStorage.setItem(Base64.encode(USER_ID), Base64.encode(payload?.toString()));
}
// 获取UID
export function getUserId() {
  return Base64.decode(localStorage.getItem(Base64.encode(USER_ID)));
}
// 保存用户信息
export function setUserInfo(payload = "") {
  localStorage.setItem(Base64.encode(USER_INFO), Base64.encode(JSON.stringify(payload)));
}
// 获取当前用户信息
export function getUserInfo() {
  let payload = localStorage.getItem(Base64.encode(USER_INFO));
  if (payload) {
    return JSON.parse(Base64.decode(payload));
  }
  return {};
}
// 删除登陆当前用户
export function removeAccount() {
  localStorage.removeItem(Base64.encode(USER_TOKEN));
  localStorage.removeItem(Base64.encode(USER_ID));
  localStorage.removeItem(Base64.encode(USER_INFO));
}
// 退出登录
export function accountLogout() {
  removeAccount();
  return true;
}
