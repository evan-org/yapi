// @ts-nocheck
/**
 * project.service 单元测试（搜索关键词校验）
 */
import test from "ava";
import projectService from "../../services/project.service.js";

test("search 空关键词返回失败", async (t) => {
  const result = await projectService.search("");
  t.false(result.ok);
  t.is(result.code, 400);
});

test("search 非法关键词返回失败", async (t) => {
  const result = await projectService.search("*bad");
  t.false(result.ok);
  t.is(result.code, 400);
});
