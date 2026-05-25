// @ts-nocheck
/**
 * CI Mongo 测试共用：连接串与 YApi db 引导（仅集成测使用）
 */
import mongoose from "mongoose";
import yapi from "../../runtime.js";
import commons from "../../utils/commons.js";
import dbModule from "../../utils/db.js";

/** 是否在 CI 环境执行 Mongo 相关用例 */
export function shouldRunMongoCi(): boolean {
  return process.env.CI === "true";
}

/** 与 workflow 一致的 Mongo 连接 URI */
export function mongoUri(): string {
  const host = process.env.YAPI_DB_HOST || "127.0.0.1";
  const port = process.env.YAPI_DB_PORT || "27017";
  const dbName = process.env.YAPI_DB_NAME || "yapi";
  return `mongodb://${host}:${port}/${dbName}`;
}

/**
 * 使用 YApi db.connect 建立连接（供 Repository / Model 单测使用）
 */
export async function connectYapiDatabase(): Promise<void> {
  yapi.commons = commons;
  await dbModule.connect();
}

/** 断开 Mongoose 连接 */
export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
