// @ts-nocheck
/**
 * project.util 单元测试
 */
import test from "ava";
import {
  normalizeBasepath,
  validateProjectBasepath,
  validateProjectSearchKeyword,
  validateProjectEnvList,
  resolveProjectMemberRole,
} from "../../services/project.util.js";

test("normalizeBasepath 规范化路径", (t) => {
  t.is(normalizeBasepath("/api/"), "/api");
  t.is(normalizeBasepath("api"), "/api");
  t.false(normalizeBasepath("/bad path"));
});

test("validateProjectBasepath 非法路径失败", (t) => {
  const result = validateProjectBasepath("/bad path");
  t.false(result.ok);
});

test("validateProjectSearchKeyword 空关键词失败", (t) => {
  const result = validateProjectSearchKeyword("  ");
  t.false(result.ok);
});

test("validateProjectEnvList 环境名重复失败", (t) => {
  const result = validateProjectEnvList([
    { name: "a", domain: "http://a" },
    { name: "a", domain: "http://b" },
  ]);
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.message, "环境变量名重复");
  }
});

test("resolveProjectMemberRole 默认 dev", (t) => {
  t.is(resolveProjectMemberRole(undefined), "dev");
  t.is(resolveProjectMemberRole("owner"), "owner");
});
