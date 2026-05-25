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

export type ChangePasswordParams = {
  uid?: number | string;
  password?: string;
  old_password?: string;
};

export type RegisterParams = {
  username?: string;
  password?: string;
  email?: string;
};

export type ParsedAvatar = {
  payload: string;
  type: string;
};

export type LdapLoginConfig = {
  emailPostfix?: string;
  emailKey?: string;
  usernameKey?: string;
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

/**
 * 修改密码必填项
 */
export function validateChangePasswordParams(
  params: ChangePasswordParams
): ServiceResult<Required<Pick<ChangePasswordParams, "uid" | "password">> & { old_password?: string }> {
  if (!params.uid) {
    return fail(400, "uid不能为空");
  }
  if (!params.password) {
    return fail(400, "密码不能为空");
  }
  return ok({
    uid: params.uid,
    password: params.password,
    old_password: params.old_password,
  });
}

/**
 * 注册必填项（不含「禁止注册」开关，由 service 判断 WEBCONFIG）
 */
export function validateRegisterFields(
  params: RegisterParams
): ServiceResult<Required<Pick<RegisterParams, "email" | "password">> & { username?: string }> {
  const email = (params.email || "").trim();
  if (!email) {
    return fail(400, "邮箱不能为空");
  }
  if (!params.password) {
    return fail(400, "密码不能为空");
  }
  return ok({
    email,
    password: params.password,
    username: params.username,
  });
}

/**
 * 解析头像 base64（png/jpeg）
 */
export function parseAvatarBasecode(basecode: string | undefined): ServiceResult<ParsedAvatar> {
  if (!basecode) {
    return fail(400, "basecode不能为空");
  }
  const pngPrefix = "data:image/png;base64,";
  const jpegPrefix = "data:image/jpeg;base64,";
  let payload = basecode;
  let type: string;
  if (basecode.substr(0, pngPrefix.length) === pngPrefix) {
    payload = basecode.substr(pngPrefix.length);
    type = "image/png";
  } else if (basecode.substr(0, jpegPrefix.length) === jpegPrefix) {
    payload = basecode.substr(jpegPrefix.length);
    type = "image/jpeg";
  } else {
    return fail(400, "仅支持jpeg和png格式的图片");
  }
  const strLength = payload.length;
  if (parseInt(String(strLength - (strLength / 8) * 2), 10) > 200000) {
    return fail(400, "图片大小不能超过200kb");
  }
  return ok({ payload, type });
}

/**
 * LDAP 登录后解析平台内邮箱与用户名
 */
export function resolveLdapIdentity(
  email: string,
  ldapInfo: Record<string, string>,
  config: LdapLoginConfig
) {
  const emailPrefix = email.split(/@/g)[0];
  const emailPostfix = config.emailPostfix;
  const emailParams =
    ldapInfo[config.emailKey || "mail"] ||
    (emailPostfix ? emailPrefix + emailPostfix : email);
  const username =
    (config.usernameKey && ldapInfo[config.usernameKey]) || emailPrefix;
  return { emailParams, username };
}
