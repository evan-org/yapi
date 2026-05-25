// @ts-nocheck
import test from "ava";
import runtime from "../../runtime.js";
import { assertRuntimeConfig } from "../../utils/configCheck.js";

test("db 配置缺失时应抛出错误", (t) => {
  const backup = Object.assign({}, runtime.WEBCONFIG);
  runtime.WEBCONFIG = {
    port: 3000,
    adminAccount: "admin@admin.com",
  };
  t.throws(() => assertRuntimeConfig(), { message: /缺少数据库配置/ });
  runtime.WEBCONFIG = backup;
});

test("adminAccount 缺失时应抛出错误", (t) => {
  const backup = Object.assign({}, runtime.WEBCONFIG);
  runtime.WEBCONFIG = {
    port: 3000,
    db: { servername: "127.0.0.1", DATABASE: "yapi" },
  };
  t.throws(() => assertRuntimeConfig(), { message: /缺少 YAPI_ADMIN_ACCOUNT/ });
  runtime.WEBCONFIG = backup;
});
