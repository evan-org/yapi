// @ts-nocheck
/**
 * CI PostgreSQL 测试共用：连接与 YApi db 引导（仅集成测使用）
 */
import yapi from "../../runtime.js";
import commons from "../../utils/commons.js";
import dbModule from "../../utils/db.js";
import { closePg } from "../../db/pg-pool.js";

/** 是否在 CI 环境执行数据库相关用例 */
export function shouldRunPgCi(): boolean {
  return process.env.CI === "true";
}

/** 与 workflow 一致的 PostgreSQL 连接 URI */
export function pgUri(): string {
  const host = process.env.YAPI_DB_HOST || "127.0.0.1";
  const port = process.env.YAPI_DB_PORT || "5432";
  const dbName = process.env.YAPI_DB_NAME || "yapi";
  const user = process.env.YAPI_DB_USER || "postgres";
  const pass = process.env.YAPI_DB_PASS || "postgres";
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${dbName}`;
}

/**
 * 使用 YApi db.connect 建立连接（供 Repository / Model 单测使用）
 */
export async function connectYapiDatabase(): Promise<void> {
  process.env.YAPI_DATABASE_URL = pgUri();
  yapi.commons = commons;
  await dbModule.connect();
}

/** 断开 PostgreSQL 连接 */
export async function disconnectPg(): Promise<void> {
  await closePg();
}
