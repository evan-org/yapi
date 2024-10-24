"use client"
// 定义用户信息的存储键
export const USER_INFO = "YAPI_USER_INFO";
// 定义用户令牌的存储键
export const USER_TOKEN = "YAPI_USER_TOKEN";
// 定义用户ID的存储键
export const USER_ID = "YAPI_USER_ID";
// 定义用户角色的存储键
export const USER_ROLE = "YAPI_USER_ROLE";
// 定义用户令牌的过期时间（天）
export const TOKEN_EXPIRE = 365;
// 令牌过期时间密钥值
export const TOKEN_EXPIRE_TIME_KEY = "YAPI_TOKEN_EXPIRE_TIME_KEY";
// 用户角色映射
export const USER_ROLE_MAP = {
  admin: "管理员",
  dev: "开发者",
  test: "测试人员",
  visitor: "游客"
};
// 用户角色权限映射
export const EMAIL_LIMIT = 50;
export const PASSWORD_LIMIT = 20;
export const NAME_LIMIT = 20;
export const PAGE_LIMIT = 10;
