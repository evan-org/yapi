// @ts-nocheck
/**
 * 数据库连接入口（PostgreSQL）
 */
import yapi from "../runtime.js";
import { connectPg, closePg } from "../db/pg-pool.js";

function connect(callback) {
  return connectPg(callback).catch((err) => {
    yapi.commons.log(String(err) + ", postgresql connect error", "error");
    throw err;
  });
}

export default {
  connect,
  close: closePg,
};
