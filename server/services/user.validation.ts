/**
 * 用户模块入参校验（纯函数，便于单测且不拉取 ldap 等重依赖）
 */
import { ok, fail, type ServiceResult } from "./service-result.js";

export type LoginCredentials = {
  email?: string;
  password?: string;
};

export type ValidatedLogin = {
  email: string;
  password: string;
};

/**
 * 校验登录邮箱与密码
 */
export function validateLoginCredentials(
  credentials: LoginCredentials
): ServiceResult<ValidatedLogin> {
  const email = (credentials.email || "").trim();
  const password = credentials.password;
  if (!email) {
    return fail(400, "email不能为空");
  }
  if (!password) {
    return fail(400, "密码不能为空");
  }
  return ok({ email, password });
}
