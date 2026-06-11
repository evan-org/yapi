// @ts-nocheck
/**
 * swaggerSync.validation 单元测试
 */
import test from "ava";
import { validateSwaggerSyncProjectId } from "../../services/swaggerSync.validation.js";

test("validateSwaggerSyncProjectId 缺少项目 id", (t) => {
  const result = validateSwaggerSyncProjectId(null);
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 408);
    t.is(result.message, "缺少项目Id");
  }
});

test("validateSwaggerSyncProjectId 成功", (t) => {
  const result = validateSwaggerSyncProjectId(10);
  t.true(result.ok);
  if (result.ok) {
    t.is(result.data, 10);
  }
});
