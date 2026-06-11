// @ts-nocheck
/**
 * 独立初始化 PostgreSQL 表与索引（不启动 HTTP 服务）
 */
import yapi from "../runtime.js";
import commons from "../utils/commons.js";
import dbModule from "../utils/db.js";

yapi.commons = commons;
await dbModule.connect();
await dbModule.close();
yapi.commons.log("PostgreSQL 表结构已就绪");
process.exit(0);
