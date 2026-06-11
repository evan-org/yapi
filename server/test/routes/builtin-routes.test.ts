// @ts-nocheck
/**
 * 内置能力路由表回归（Wiki、统计、导出等，原 extensions 已拆分为业务模块）
 */
import test from "ava";
import {
  advancedMockHttpRoutes,
  exportHttpRoutes,
  statisticsHttpRoutes,
  swaggerSyncHttpRoutes,
  wikiHttpRoutes,
} from "../../routes/modules/builtin-routes.config.js";

const allRoutes = [
  ...advancedMockHttpRoutes.map((r) => `advanced-mock${r.path ? `/${r.path}` : ""}`),
  ...statisticsHttpRoutes.map((r) => `statistics/${r.path}`),
  ...exportHttpRoutes.map((r) => `export/${r.path}`),
  ...wikiHttpRoutes.map((r) => (r.path ? `wiki/${r.path}` : "wiki")),
  ...swaggerSyncHttpRoutes.map((r) => (r.path ? `swagger-sync/${r.path}` : "swagger-sync")),
];

const EXPECTED = [
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

test("内置能力路由 path 未遗漏", (t) => {
  for (const p of EXPECTED) {
    t.true(allRoutes.includes(p), `缺少路由 path: ${p}`);
  }
  t.is(
    advancedMockHttpRoutes.length +
      statisticsHttpRoutes.length +
      exportHttpRoutes.length +
      wikiHttpRoutes.length +
      swaggerSyncHttpRoutes.length,
    17
  );
});
