// @ts-nocheck
import runtime from '../runtime.js';

/**
 * 启动前校验环境变量 / 配置是否包含必要字段
 */
function assertRuntimeConfig() {
  const config = runtime.WEBCONFIG;

  if (!config.port) {
    throw new Error("缺少 YAPI_PORT 或服务端口配置");
  }
  if (!config.db) {
    throw new Error("缺少数据库配置（YAPI_MONGODB_URI 或 YAPI_DB_HOST + YAPI_DB_NAME）");
  }
  if (!config.db.connectString && (!config.db.servername || !config.db.DATABASE)) {
    throw new Error("数据库需配置 YAPI_MONGODB_URI 或 YAPI_DB_HOST + YAPI_DB_NAME");
  }
  if (!config.adminAccount) {
    throw new Error("缺少 YAPI_ADMIN_ACCOUNT（安装后管理员邮箱）");
  }
}

export { assertRuntimeConfig };

export default {
  assertRuntimeConfig
};
