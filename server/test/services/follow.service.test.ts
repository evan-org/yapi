// @ts-nocheck
/**
 * follow.service 单元测试（参数校验，不依赖数据库）
 */
import test from "ava";
import followService from "../../services/follow.service.js";

test("listByUser 缺少 uid 返回失败", async (t) => {
  const result = await followService.listByUser(null);
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "用户id不能为空");
  }
});

test("unfollow 缺少 projectid 返回失败", async (t) => {
  const result = await followService.unfollow(1, undefined);
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
  }
});

test("follow 缺少 projectid 返回失败", async (t) => {
  const result = await followService.follow(1, null);
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
  }
});
