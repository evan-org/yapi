import test from "ava";
import path from "path";

const configCheckPath = path.join(__dirname, "../../server/utils/configCheck.js");
const yapiPath = path.join(__dirname, "../../server/yapi.js");

test("db 配置缺失时应抛出错误", (t) => {
  const yapi = require(yapiPath);
  const { assertRuntimeConfig } = require(configCheckPath);
  const backup = Object.assign({}, yapi.WEBCONFIG);

  yapi.WEBCONFIG = {
    port: "3000",
    adminAccount: "admin@admin.com"
  };

  const error = t.throws(() => assertRuntimeConfig());
  t.regex(error.message, /db/);

  Object.assign(yapi.WEBCONFIG, backup);
});

test("adminAccount 缺失时应抛出错误", (t) => {
  const yapi = require(yapiPath);
  const { assertRuntimeConfig } = require(configCheckPath);
  const backup = Object.assign({}, yapi.WEBCONFIG);

  yapi.WEBCONFIG = {
    port: "3000",
    db: { servername: "127.0.0.1", DATABASE: "yapi", port: 27017 }
  };

  const error = t.throws(() => assertRuntimeConfig());
  t.regex(error.message, /adminAccount/);

  Object.assign(yapi.WEBCONFIG, backup);
});
