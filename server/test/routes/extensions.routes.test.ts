// @ts-nocheck
/**
 * 内置扩展路由表回归：确保 /api/plugin/* 端点未遗漏
 */
import test from "ava";
import { extensionHttpRoutes } from "../../routes/modules/extension-routes.config.js";

const EXPECTED_PATHS = [
  "advmock/get",
  "advmock/save",
  "advmock/case/save",
  "advmock/case/get",
  "advmock/case/list",
  "advmock/case/del",
  "advmock/case/hide",
  "statismock/count",
  "statismock/get",
  "statismock/get_system_status",
  "statismock/group_data_statis",
  "wiki_desc/get",
  "wiki_desc/up",
  "export",
  "exportSwagger",
  "autoSync/get",
  "autoSync/save",
];

test("extensionHttpRoutes 包含全部内置扩展端点", (t) => {
  const paths = extensionHttpRoutes.map((r) => r.path);
  for (const p of EXPECTED_PATHS) {
    t.true(paths.includes(p), `缺少路由 path: ${p}`);
  }
  t.is(paths.length, EXPECTED_PATHS.length);
});
