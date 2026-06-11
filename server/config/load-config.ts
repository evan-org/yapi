// @ts-nocheck
/**
 * 运行时配置：环境变量 + server/.env + server/.env.local（本地私密配置，后者优先）
 */
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type { YapiWebConfig } from "../types/global.js";

/** 加载 .env（可选默认）与 .env.local（本地私密，覆盖前者） */
export function loadEnvFiles(serverRoot: string) {
  loadDotenv({ path: path.join(serverRoot, ".env") });
  if (process.env.YAPI_ENV === "test") {
    return;
  }
  loadDotenv({
    path: path.join(serverRoot, ".env.local"),
    override: true,
  });
}

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

/** 解析布尔环境变量 */
function envBool(key: string, defaultValue = false): boolean {
  const v = envStr(key);
  if (v === undefined) {
    return defaultValue;
  }
  return v === "true" || v === "1" || v === "yes";
}

/** 解析 JSON 对象环境变量 */
function parseJsonEnv<T extends Record<string, unknown>>(
  key: string
): T | undefined {
  const raw = envStr(key);
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as T) : undefined;
  } catch (err) {
    console.error(`${key} JSON 解析失败`, err);
    return undefined;
  }
}

/** 解析 JSON 数组环境变量 */
function parseJsonArrayEnv(key: string): unknown[] {
  const raw = envStr(key);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`${key} JSON 解析失败`, err);
    return [];
  }
}

/**
 * PostgreSQL：YAPI_DATABASE_URL 或分项变量
 */
function buildDbFromEnv(): Record<string, unknown> {
  const connectString =
    envStr("YAPI_DATABASE_URL") || envStr("YAPI_POSTGRES_URI");
  if (connectString) {
    return { connectString };
  }

  const servername = envStr("YAPI_DB_HOST");
  const DATABASE = envStr("YAPI_DB_NAME");
  const port = Number(envStr("YAPI_DB_PORT") || "5432");
  const user = envStr("YAPI_DB_USER");
  const pass = envStr("YAPI_DB_PASS");
  const poolSize = envStr("YAPI_DB_POOL_SIZE");
  const ssl = envBool("YAPI_DB_SSL", false);

  const db: Record<string, unknown> = { port };
  if (ssl) {
    db.ssl = true;
  }
  if (servername) {
    db.servername = servername;
  }
  if (DATABASE) {
    db.DATABASE = DATABASE;
  }
  if (user) {
    db.user = user;
  }
  if (pass) {
    db.pass = pass;
  }
  if (poolSize) {
    db.poolSize = Number(poolSize);
  }
  return db;
}

/** 邮件配置 */
function buildMailFromEnv(): Record<string, unknown> {
  const enable = envBool("YAPI_MAIL_ENABLE", false);
  const mail: Record<string, unknown> = { enable };
  const host = envStr("YAPI_MAIL_HOST");
  const port = envStr("YAPI_MAIL_PORT");
  const from = envStr("YAPI_MAIL_FROM");
  const user = envStr("YAPI_MAIL_USER");
  const pass = envStr("YAPI_MAIL_PASS");
  if (host) {
    mail.host = host;
  }
  if (port) {
    mail.port = Number(port);
  }
  if (from) {
    mail.from = from;
  }
  if (user || pass) {
    mail.auth = {
      ...(user ? { user } : {}),
      ...(pass ? { pass } : {}),
    };
  }
  return mail;
}

/**
 * 加载 WEBCONFIG：dotenv + process.env
 * @param serverRoot server 工作区根目录（含 .env.local）
 */
export function loadWebConfig(serverRoot: string): YapiWebConfig {
  loadEnvFiles(serverRoot);

  return {
    port: Number(envStr("YAPI_PORT") || "7102"),
    adminAccount: envStr("YAPI_ADMIN_ACCOUNT"),
    timeout: Number(envStr("YAPI_TIMEOUT") || "120000"),
    closeRegister: envBool("YAPI_CLOSE_REGISTER", false),
    passsalt: envStr("YAPI_PASS_SALT"),
    scriptEnable: envBool("YAPI_SCRIPT_ENABLE", false),
    versionNotify: envBool("YAPI_VERSION_NOTIFY", false),
    db: buildDbFromEnv(),
    mail: buildMailFromEnv(),
    ldapLogin: parseJsonEnv("YAPI_LDAP_LOGIN"),
    integrations: parseJsonArrayEnv("YAPI_INTEGRATIONS"),
  };
}
