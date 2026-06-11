// @ts-nocheck
/**
 * open.service 单元测试（纯函数）
 */
import test from "ava";
import { parseEnvParams, summarizeTestResults } from "../../services/open.service.js";

test("parseEnvParams 解析 env_ 前缀参数", (t) => {
  const result = parseEnvParams({ env_123: " prod ", other: "x" });
  t.is(result.length, 1);
  t.is(result[0].project_id, "123");
  t.is(result[0].curEnv, "prod");
});

test("summarizeTestResults 统计通过/失败数", (t) => {
  const summary = summarizeTestResults([{ code: 0 }, { code: 1 }, { code: 0 }]);
  t.is(summary.len, 3);
  t.is(summary.successNum, 2);
  t.is(summary.failedNum, 1);
  t.true(summary.msg.includes("2 个验证通过"));
});
