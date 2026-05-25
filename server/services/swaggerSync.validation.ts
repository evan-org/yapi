/**
 * Swagger 自动同步模块入参校验
 */
import { ok, fail, type ServiceResult } from "./service-result.js";

/**
 * 校验项目 id（插件接口使用 408 错误码）
 */
export function validateSwaggerSyncProjectId(
  projectId: number | string | null | undefined
): ServiceResult<number | string> {
  if (projectId == null || projectId === "") {
    return fail(408, "缺少项目Id");
  }
  return ok(projectId);
}
