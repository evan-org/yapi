// @ts-nocheck
import test from "ava";
import yapi from "../../yapi.js";
import { assertRuntimeConfig } from "../../utils/configCheck.js";

test("db 配置缺失时应抛出错误", (t) => {
  const backup = Object.assign({}, yapi.WEBCONFIG);
  yapi.WEBCONFIG = {
    port: 3000,
    adminAccount: "admin@admin.com",
  };
  t.throws(() => assertRuntimeConfig(), /缺少 db 配置/);
  yapi.WEBCONFIG = backup;
});

test("adminAccount 缺失时应抛出错误", (t) => {
  const backup = Object.assign({}, yapi.WEBCONFIG);
  yapi.WEBCONFIG = {
    port: 3000,
    db: { servername: "127.0.0.1", DATABASE: "yapi" },
  };
  t.throws(() => assertRuntimeConfig(), /缺少 adminAccount/);
  yapi.WEBCONFIG = backup;
});
