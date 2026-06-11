// @ts-nocheck
/**
 * load-config：仅从环境变量构建 WEBCONFIG
 */
import test from "ava";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWebConfig } from "../../config/load-config.js";

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("loadWebConfig 不读取遗留 config.json 文件", (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "yapi-cfg-"));
  const legacy = path.join(tmp, "config.json");
  fs.writeFileSync(
    legacy,
    JSON.stringify({ port: 1, adminAccount: "legacy@evil.com" })
  );
  const prev = { ...process.env };
  process.env.YAPI_PORT = "3002";
  process.env.YAPI_ADMIN_ACCOUNT = "env@example.com";

  const cfg = loadWebConfig(tmp);
  t.is(cfg.port, 3002);
  t.is(cfg.adminAccount, "env@example.com");

  fs.rmSync(tmp, { recursive: true, force: true });
  process.env = prev;
});

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
