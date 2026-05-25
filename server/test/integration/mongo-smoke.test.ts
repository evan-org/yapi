// @ts-nocheck
/**
 * MongoDB 连通性冒烟（仅在 CI 环境执行，本地无 Mongo 时跳过）
 */
import test from "ava";
import mongoose from "mongoose";

const shouldRun = process.env.CI === "true";

test("MongoDB 服务可连接", async (t) => {
  if (!shouldRun) {
    t.pass();
    return;
  }
  const host = process.env.YAPI_DB_HOST || "127.0.0.1";
  const port = process.env.YAPI_DB_PORT || "27017";
  const dbName = process.env.YAPI_DB_NAME || "yapi";
  const uri = `mongodb://${host}:${port}/${dbName}`;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
  try {
    t.is(mongoose.connection.readyState, 1);
    const admin = mongoose.connection.db.admin();
    const ping = await admin.ping();
    t.is(ping.ok, 1);
  } finally {
    await mongoose.disconnect();
  }
});
