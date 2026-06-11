/**
 * 接口模块入参校验（纯函数，便于单测）
 */
import { ok, fail, type ServiceResult } from "./service-result.js";

export type AddCategoryInput = {
  name?: string;
  project_id?: number | string | null;
  desc?: string;
  uid?: number | string;
  username?: string;
};

export type ValidatedAddCategory = {
  name: string;
  project_id: number | string;
  desc?: string;
  uid?: number | string;
  username?: string;
};

/**
 * 新增接口分类必填项
 */
export function validateAddCategoryParams(
  params: AddCategoryInput
): ServiceResult<ValidatedAddCategory> {
  if (params.project_id == null || params.project_id === "") {
    return fail(400, "项目id不能为空");
  }
  const name = (params.name || "").trim();
  if (!name) {
    return fail(400, "名称不能为空");
  }
  return ok({
    name,
    project_id: params.project_id,
    desc: params.desc,
    uid: params.uid,
    username: params.username,
  });
}

/**
 * 分类 id（删除/更新/列表）
 */
export function validateCategoryId(
  catId: number | string | null | undefined
): ServiceResult<number | string> {
  if (catId == null || catId === "") {
    return fail(400, "catid不能为空");
  }
  return ok(catId);
}

/**
 * 项目 id（接口列表、批量上传等）
 */
export function validateInterfaceProjectId(
  projectId: number | string | null | undefined
): ServiceResult<number | string> {
  if (projectId == null || projectId === "") {
    return fail(400, "项目id不能为空");
  }
  return ok(projectId);
}

/**
 * 自定义字段查询：仅允许单个查询键
 */
export function validateCustomFieldQuery(
  queryParams: Record<string, unknown> | null | undefined
): ServiceResult<{ fieldName: string; fieldValue: unknown }> {
  const keys = Object.keys(queryParams || {});
  if (keys.length !== 1) {
    return fail(400, "参数数量错误");
  }
  const fieldName = keys[0];
  return ok({
    fieldName,
    fieldValue: queryParams[fieldName],
  });
}

/**
 * 批量排序：请求体必须为数组
 */
export function validateIndexBatchItems(
  items: unknown
): ServiceResult<Array<{ id?: unknown; index?: unknown }>> {
  if (!items || !Array.isArray(items)) {
    return fail(400, "请求参数必须是数组");
  }
  return ok(items as Array<{ id?: unknown; index?: unknown }>);
}

/**
 * Chrome 插件批量上传必填项
 */
export function validateBatchUploadInput(input: {
  project_id?: number | string | null;
  raw?: unknown;
}): ServiceResult<{ project_id: number | string; raw: unknown }> {
  const projectValidated = validateInterfaceProjectId(input.project_id);
  if (!projectValidated.ok) {
    return fail(400, "project_id 不能为空");
  }
  if (input.raw == null || input.raw === "") {
    return fail(400, "data 不能为空");
  }
  return ok({
    project_id: projectValidated.data,
    raw: input.raw,
  });
}

/**
 * 接口 id（编辑锁、冲突检测等）
 */
export function validateInterfaceId(
  id: number | string | null | undefined
): ServiceResult<number | string> {
  if (id == null || id === "") {
    return fail(400, "id 参数有误");
  }
  return ok(id);
}
