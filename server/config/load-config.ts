// @ts-nocheck
/**
 * 从环境变量加载配置，config.json 仅作可选兜底（便于迁移）
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type { YapiWebConfig } from "../types/global.js";

/**
 * 读取字符串环境变量，空串视为未设置
 */
function envStr(key: string): string | undefined {
  const v = process.env[key];
  if (v === undefined || v === "") {
    return undefined;
  }
  return v;
}

/**
 * 环境变量优先，否则使用文件配置中的值
 */
function pick<T>(envKey: string, fallback: T | undefined): T | undefined {
  const fromEnv = envStr(envKey);
  if (fromEnv !== undefined) {
    return fromEnv as T;
  }
  return fallback;
}

/**
 * 解析 plugins 配置（JSON 字符串）
 */
function parsePlugins(raw: string | undefined, filePlugins: unknown): unknown[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("YAPI_PLUGINS 解析失败，回退 config.json", err);
    }
  }
  return Array.isArray(filePlugins) ? filePlugins : [];
}

/**
 * 合并 db 段：支持 YAPI_MONGODB_URI 或分项变量
 */
function buildDb(fileDb: Record<string, unknown> = {}): Record<string, unknown> {
  const uri = envStr("YAPI_MONGODB_URI");
  if (uri) {
    return { ...fileDb, connectString: uri };
  }
  const servername = pick("YAPI_DB_HOST", fileDb.servername as string);
  const DATABASE = pick("YAPI_DB_NAME", fileDb.DATABASE as string);
  const portRaw = pick("YAPI_DB_PORT", fileDb.port != null ? String(fileDb.port) : undefined);
  const user = pick("YAPI_DB_USER", fileDb.user as string);
  const pass = pick("YAPI_DB_PASS", fileDb.pass as string);
  const authSource = pick("YAPI_DB_AUTH_SOURCE", fileDb.authSource as string);

  const db: Record<string, unknown> = { ...fileDb };
  if (servername) {
    db.servername = servername;
  }
  if (DATABASE) {
    db.DATABASE = DATABASE;
  }
  if (portRaw) {
    db.port = Number(portRaw);
  }
  if (user) {
    db.user = user;
  }
  if (pass) {
    db.pass = pass;
  }
  if (authSource !== undefined) {
    db.authSource = authSource;
  }
  return db;
}

/**
 * 合并 mail 段
 */
function buildMail(fileMail: Record<string, unknown> = {}): Record<string, unknown> {
  const enableEnv = envStr("YAPI_MAIL_ENABLE");
  const enable =
    enableEnv !== undefined ? enableEnv === "true" || enableEnv === "1" : fileMail.enable;

  const host = pick("YAPI_MAIL_HOST", fileMail.host as string);
  const portRaw = pick("YAPI_MAIL_PORT", fileMail.port != null ? String(fileMail.port) : undefined);
  const from = pick("YAPI_MAIL_FROM", fileMail.from as string);
  const user = pick("YAPI_MAIL_USER", (fileMail.auth as Record<string, string>)?.user);
  const pass = pick("YAPI_MAIL_PASS", (fileMail.auth as Record<string, string>)?.pass);

  const mail: Record<string, unknown> = { ...fileMail, enable };
  if (host) {
    mail.host = host;
  }
  if (portRaw) {
    mail.port = Number(portRaw);
  }
  if (from) {
    mail.from = from;
  }
  if (user || pass) {
    mail.auth = {
      ...(fileMail.auth as object),
      ...(user ? { user } : {}),
      ...(pass ? { pass } : {}),
    };
  }
  return mail;
}

/**
 * 加载 WEBCONFIG：先读 server/.env，再与 config.json 合并（环境变量优先）
 */
export function loadWebConfig(webrootServer: string): YapiWebConfig {
  loadDotenv({ path: path.join(webrootServer, ".env") });

  let fileConfig: YapiWebConfig = {};
  const configPath = path.join(webrootServer, "config.json");
  if (existsSync(configPath)) {
    fileConfig = JSON.parse(readFileSync(configPath, "utf8"));
  }

  const portRaw = pick("YAPI_PORT", fileConfig.port != null ? String(fileConfig.port) : "3001");
  const timeoutRaw = pick(
    "YAPI_TIMEOUT",
    fileConfig.timeout != null ? String(fileConfig.timeout) : "120000"
  );

  return {
    ...fileConfig,
    port: Number(portRaw),
    adminAccount: pick("YAPI_ADMIN_ACCOUNT", fileConfig.adminAccount),
    timeout: Number(timeoutRaw),
    closeRegister:
      envStr("YAPI_CLOSE_REGISTER") === "true" || fileConfig.closeRegister === true,
    passsalt: pick("YAPI_PASS_SALT", fileConfig.passsalt as string),
    db: buildDb((fileConfig.db || {}) as Record<string, unknown>),
    mail: buildMail((fileConfig.mail || {}) as Record<string, unknown>),
    ldap: fileConfig.ldap,
    plugins: parsePlugins(envStr("YAPI_PLUGINS"), fileConfig.plugins),
  };
}
