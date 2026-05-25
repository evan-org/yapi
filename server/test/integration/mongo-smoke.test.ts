// @ts-nocheck
/**
 * MongoDB 连通性冒烟（仅在 CI 环境执行，本地无 Mongo 时跳过）
 */
import test from "ava";
import mongoose from "mongoose";
import {
  shouldRunMongoCi,
  mongoUri,
  disconnectMongo,
} from "../helpers/mongo-ci.js";

function mongoUri() {
  const host = process.env.YAPI_DB_HOST || "127.0.0.1";
  const port = process.env.YAPI_DB_PORT || "27017";
  const dbName = process.env.YAPI_DB_NAME || "yapi";
  return `mongodb://${host}:${port}/${dbName}`;
}

test("MongoDB 服务可连接", async (t) => {
  if (!shouldRunMongoCi()) {
    t.pass();
    return;
  }
  await mongoose.connect(mongoUri(), {
    serverSelectionTimeoutMS: 8000,
  });
  try {
    t.is(mongoose.connection.readyState, 1);
    const admin = mongoose.connection.db.admin();
    const ping = await admin.ping();
    t.is(ping.ok, 1);
  } finally {
    await disconnectMongo();
  }
});

test("MongoDB 集合可写入并查询", async (t) => {
  if (!shouldRunMongoCi()) {
    t.pass();
    return;
  }
  const collectionName = `ci_smoke_${Date.now()}`;
  const schema = new mongoose.Schema({
    marker: { type: String, required: true },
    ts: Number,
  });
  const SmokeModel = mongoose.model(collectionName, schema, collectionName);

  await mongoose.connect(mongoUri(), {
    serverSelectionTimeoutMS: 8000,
  });
  try {
    const marker = `yapi-ci-${Date.now()}`;
    await SmokeModel.create({ marker, ts: Date.now() });
    const found = await SmokeModel.findOne({ marker }).lean();
    t.truthy(found);
    t.is(found.marker, marker);
    await SmokeModel.deleteMany({ marker });
  } finally {
    await disconnectMongo();
  }
});

test("MongoDB 集合可写入并查询", async (t) => {
  if (!shouldRun) {
    t.pass();
    return;
  }
  const collectionName = `ci_smoke_${Date.now()}`;
  const schema = new mongoose.Schema({
    marker: { type: String, required: true },
    ts: Number,
  });
  const SmokeModel = mongoose.model(collectionName, schema, collectionName);

  await mongoose.connect(mongoUri(), {
    serverSelectionTimeoutMS: 8000,
  });
  try {
    const marker = `yapi-ci-${Date.now()}`;
    await SmokeModel.create({ marker, ts: Date.now() });
    const found = await SmokeModel.findOne({ marker }).lean();
    t.truthy(found);
    t.is(found.marker, marker);
    await SmokeModel.deleteMany({ marker });
  } finally {
    await mongoose.disconnect();
  }
});
