// @ts-nocheck
/**
 * 内置扩展路由表回归：确保 /api/extensions/* 端点未遗漏
 */
import test from "ava";
import { extensionHttpRoutes } from "../../routes/modules/extension-routes.config.js";

const EXPECTED_PATHS = [
  "advanced-mock",
  "advanced-mock/cases",
  "advanced-mock/cases/detail",
  "advanced-mock/cases/delete",
  "advanced-mock/cases/hide",
  "statistics/summary",
  "statistics/mock-log",
  "statistics/system",
  "statistics/groups",
  "wiki",
  "export/data",
  "export/swagger",
  "swagger-sync",
];

test("extensionHttpRoutes 包含全部内置扩展端点", (t) => {
  const paths = extensionHttpRoutes.map((r) => r.path);
  for (const p of EXPECTED_PATHS) {
    t.true(paths.includes(p), `缺少路由 path: ${p}`);
  }
  t.is(extensionHttpRoutes.length, 17);
});
