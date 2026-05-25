// @ts-nocheck
/**
 * 数据访问入口：PostgreSQL JSONB 兼容层（替代 Mongoose）
 */
import yapi from "../runtime.js";
import { connectPg, closePg } from "../db/pg-pool.js";
import { createPgModel } from "../db/collection.js";

function model(modelName: string, schema?: unknown) {
  return createPgModel(modelName, schema);
}

function connect(callback?: () => void) {
  return connectPg(callback).catch((err) => {
    yapi.commons.log(String(err) + ", postgresql connect error", "error");
  });
}

yapi.db = model;

export default {
  model,
  connect,
  close: closePg,
};
