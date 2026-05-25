// @ts-nocheck
/**
 * load-config：仅从环境变量构建 WEBCONFIG
 */
import test from "ava";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWebConfig } from "../../config/load-config.js";

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("loadWebConfig 读取 YAPI_* 环境变量", (t) => {
  const prev = { ...process.env };
  process.env.YAPI_PORT = "3999";
  process.env.YAPI_ADMIN_ACCOUNT = "test@example.com";
  process.env.YAPI_DB_HOST = "db.local";
  process.env.YAPI_DB_NAME = "yapi_test";
  process.env.YAPI_MAIL_ENABLE = "false";

  const cfg = loadWebConfig(serverRoot);
  t.is(cfg.port, 3999);
  t.is(cfg.adminAccount, "test@example.com");
  t.is(cfg.db.servername, "db.local");
  t.is(cfg.db.DATABASE, "yapi_test");
  t.false(cfg.mail.enable);

  process.env = prev;
});
