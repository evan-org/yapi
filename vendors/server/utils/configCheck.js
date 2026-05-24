const fs = require("fs");
const path = require("path");
const yapi = require("../yapi.js");

/**
 * 启动前校验 config.json 是否存在且包含必要字段
 */
function assertRuntimeConfig() {
  const configPath = path.join(yapi.WEBROOT_RUNTIME, "config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `未找到配置文件: ${configPath}\n请复制 vendors/config_example.json 为 config.json 并修改数据库等配置。`
    );
  }

  const config = yapi.WEBCONFIG;

  if (!config.port) {
    throw new Error("config.json 缺少 port 配置");
  }
  if (!config.db) {
    throw new Error("config.json 缺少 db 配置");
  }
  if (!config.db.connectString && (!config.db.servername || !config.db.DATABASE)) {
    throw new Error("config.json 的 db 需配置 connectString 或 servername + DATABASE");
  }
  if (!config.adminAccount) {
    throw new Error("config.json 缺少 adminAccount（安装后管理员邮箱）");
  }
}

module.exports = {
  assertRuntimeConfig
};
