/**
 * 测试集合模块入参校验（纯函数，便于单测）
 */
import { ok, fail, type ServiceResult, type ServiceFail } from "./service-result.js";

function propagateFail<T>(result: ServiceResult<T>): ServiceFail | null {
  if (!result.ok) {
    return result as ServiceFail;
  }
  return null;
}

/** 校验项目 id */
export function validateColProjectId(
  projectId: number | string | null | undefined
): ServiceResult<number | string> {
  if (projectId == null || projectId === "") {
    return fail(400, "项目id不能为空");
  }
  return ok(projectId);
}

/** 校验接口集 id */
export function validateColId(
  colId: number | string | null | undefined,
  emptyMessage = "接口集id不能为空"
): ServiceResult<number | string> {
  if (colId == null || colId === "" || colId == 0) {
    const code = emptyMessage === "col_id不能为空" ? 407 : 400;
    return fail(code, emptyMessage);
  }
  return ok(colId);
}

/**
 * 新增测试集合必填项
 */
export function validateAddColParams(params: {
  name?: string;
  project_id?: number | string | null;
  desc?: string;
  uid?: number | string;
  username?: string;
}): ServiceResult<{
  name: string;
  project_id: number | string;
  desc?: string;
  uid?: number | string;
  username?: string;
}> {
  const projectFail = propagateFail(validateColProjectId(params.project_id));
  if (projectFail) {
    return projectFail;
  }
  const name = (params.name || "").trim();
  if (!name) {
    return fail(400, "名称不能为空");
  }
  return ok({
    name,
    project_id: params.project_id as number | string,
    desc: params.desc,
    uid: params.uid,
    username: params.username,
  });
}

/**
 * 新增测试用例必填项
 */
export function validateAddCaseParams(params: {
  project_id?: number | string | null;
  interface_id?: number | string | null;
  col_id?: number | string | null;
  casename?: string;
  case_env?: string;
  [key: string]: unknown;
}): ServiceResult<Record<string, unknown>> {
  const projectFail = propagateFail(validateColProjectId(params.project_id));
  if (projectFail) {
    return projectFail;
  }
  if (params.interface_id == null || params.interface_id === "") {
    return fail(400, "接口id不能为空");
  }
  if (params.col_id == null || params.col_id === "") {
    return fail(400, "接口集id不能为空");
  }
  const casename = (params.casename || "").trim();
  if (!casename) {
    return fail(400, "用例名称不能为空");
  }
  return ok({
    ...params,
    project_id: params.project_id as number | string,
    casename,
  });
}

/** 用例 id */
export function validateCaseId(
  caseId: number | string | null | undefined
): ServiceResult<number | string> {
  if (caseId == null || caseId === "") {
    return fail(400, "用例id不能为空");
  }
  return ok(caseId);
}

/**
 * 批量从接口列表导入用例
 */
export function validateAddCaseListInput(input: {
  project_id?: number | string | null;
  col_id?: number | string | null;
  interface_list?: unknown;
}): ServiceResult<{
  project_id: number | string;
  col_id: number | string;
  interface_list: unknown[];
}> {
  if (!input.interface_list || !Array.isArray(input.interface_list)) {
    return fail(400, "interface_list 参数有误");
  }
  const projectFail = propagateFail(validateColProjectId(input.project_id));
  if (projectFail) {
    return projectFail;
  }
  const colFail = propagateFail(validateColId(input.col_id, "接口集id不能为空"));
  if (colFail) {
    return colFail;
  }
  return ok({
    project_id: input.project_id as number | string,
    col_id: input.col_id as number | string,
    interface_list: input.interface_list,
  });
}

/**
 * 克隆用例到另一集合
 */
export function validateCloneCaseListInput(input: {
  project_id?: number | string | null;
  col_id?: number | string | null;
  new_col_id?: number | string | null;
}): ServiceResult<{
  project_id: number | string;
  col_id: number | string;
  new_col_id: number | string;
}> {
  const projectFail = propagateFail(validateColProjectId(input.project_id));
  if (projectFail) {
    return projectFail;
  }
  if (input.col_id == null || input.col_id === "") {
    return fail(400, "被克隆的接口集id不能为空");
  }
  if (input.new_col_id == null || input.new_col_id === "") {
    return fail(400, "克隆的接口集id不能为空");
  }
  return ok({
    project_id: input.project_id as number | string,
    col_id: input.col_id,
    new_col_id: input.new_col_id,
  });
}

/**
 * 批量排序：请求体必须为数组
 */
export function validateColIndexBatchItems(
  items: unknown
): ServiceResult<Array<{ id?: unknown; index?: unknown }>> {
  if (!items || !Array.isArray(items)) {
    return fail(400, "请求参数必须是数组");
  }
  return ok(items as Array<{ id?: unknown; index?: unknown }>);
}
