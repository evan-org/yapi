// @ts-nocheck
/**
 * log.service 单元测试（参数校验，不依赖数据库）
 */
import test from "ava";
import logService from "../../services/log.service.js";

test("listPaged 缺少 typeid 返回失败", async (t) => {
  const result = await logService.listPaged({ type: "project" });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "typeid不能为空");
  }
});

test("listPaged 缺少 type 返回失败", async (t) => {
  const result = await logService.listPaged({ typeid: 1 });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "type不能为空");
  }
});

test("listPaged 不支持的 type 返回失败", async (t) => {
  const result = await logService.listPaged({ typeid: 1, type: "unknown" });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "type不支持");
  }
});
