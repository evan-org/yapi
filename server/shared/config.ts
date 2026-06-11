// @ts-nocheck
/**
 * 运行时配置统一出口（shared 层）
 *
 * 新代码优先从此处读取配置，避免散落 yapi.WEBCONFIG
 */
import type { YapiWebConfig } from "../types/global.js";
import yapi from "../runtime.js";

export function getAppConfig(): YapiWebConfig {
  return yapi.WEBCONFIG;
}

export function getAppPaths() {
  return {
    webroot: yapi.WEBROOT,
    webrootServer: yapi.WEBROOT_SERVER,
    webrootRuntime: yapi.WEBROOT_RUNTIME,
    webrootLog: yapi.WEBROOT_LOG,
  };
}

export function getMailTransport() {
  return yapi.mail;
}

export function canRegister(): boolean {
  return !getAppConfig().closeRegister;
}

export function isLdapEnabled(): boolean {
  const ldapLogin = getAppConfig().ldapLogin as { enable?: boolean } | undefined;
  return Boolean(ldapLogin?.enable);
}
