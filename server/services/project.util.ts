/**
 * 项目模块纯函数（路径规范化、参数校验，便于单测）
 */
import { validateSearchKeyword } from "../utils/commons.js";
import { ok, fail, type ServiceResult } from "./service-result.js";

export const PROJECT_MEMBER_ROLE_LABEL: Record<string, string> = {
  owner: "组长",
  dev: "开发者",
  guest: "访客",
};

export type ProjectMemberRole = "owner" | "dev" | "guest";

/** 新建项目默认环境 */
export const DEFAULT_PROJECT_ENV = [{ name: "local", domain: "http://127.0.0.1" }];

/**
 * 规范化项目 basepath；非法时返回 false
 */
export function normalizeBasepath(basepath?: string): string | false {
  if (!basepath) {
    return "";
  }
  if (basepath === "/") {
    return "";
  }
  if (basepath[0] !== "/") {
    basepath = "/" + basepath;
  }
  if (basepath[basepath.length - 1] === "/") {
    basepath = basepath.substr(0, basepath.length - 1);
  }
  if (!/^\/[a-zA-Z0-9\-\/\._]+$/.test(basepath)) {
    return false;
  }
  return basepath;
}

/**
 * 校验并规范化 basepath（供 create/update 使用）
 */
export function validateProjectBasepath(
  basepath?: string
): ServiceResult<string> {
  const normalized = normalizeBasepath(basepath || "");
  if (normalized === false) {
    return fail(401, "basepath格式有误");
  }
  return ok(normalized);
}

/** 数组某字段是否重复 */
export function hasDuplicateField(
  arr: Array<Record<string, unknown>>,
  key: string
): boolean {
  const s = new Set();
  arr.forEach((item) => s.add(item[key]));
  return s.size !== arr.length;
}

/**
 * 解析项目成员角色
 */
export function resolveProjectMemberRole(role?: string): ProjectMemberRole {
  const found = (["owner", "dev", "guest"] as const).find((v) => v === role);
  return found || "dev";
}

/**
 * 项目搜索关键词校验
 */
export function validateProjectSearchKeyword(
  keyword?: string
): ServiceResult<string> {
  const q = (keyword || "").trim();
  if (!q) {
    return fail(400, "No keyword.");
  }
  if (!validateSearchKeyword(q)) {
    return fail(400, "Bad query.");
  }
  return ok(q);
}

/**
 * Swagger URL 必填
 */
export function validateSwaggerUrl(url?: string): ServiceResult<string> {
  if (!url) {
    return fail(400, "url 不能为空");
  }
  return ok(url);
}

/**
 * 项目名必填
 */
export function validateProjectName(name?: string): ServiceResult<string> {
  if (!name) {
    return fail(401, "项目名不能为空");
  }
  return ok(name);
}

/**
 * 项目 id 必填
 */
export function validateProjectId(projectId?: number | string): ServiceResult<number | string> {
  if (!projectId) {
    return fail(405, "项目id不能为空");
  }
  return ok(projectId);
}

/**
 * 环境变量列表格式
 */
export function validateProjectEnvList(
  env: unknown
): ServiceResult<Array<Record<string, unknown>>> {
  if (!env || !Array.isArray(env)) {
    return fail(405, "env参数格式有误");
  }
  if (hasDuplicateField(env, "name")) {
    return fail(405, "环境变量名重复");
  }
  return ok(env);
}

/**
 * tag 列表格式
 */
export function validateProjectTagList(
  tag: unknown
): ServiceResult<Array<Record<string, unknown>>> {
  if (!tag || !Array.isArray(tag)) {
    return fail(405, "tag参数格式有误");
  }
  return ok(tag);
}
