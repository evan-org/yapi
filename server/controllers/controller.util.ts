/**
 * 控制器层 HTTP 响应辅助
 * 将 ServiceResult 与异常统一写入 AppContext.body
 */
import type { AppContext } from "../types/app-context.js";
import type { ServiceResult } from "../services/service-result.js";
import commons from "../utils/commons.js";

/** Service 结果 → ctx.body（与历史 resReturn 信封一致） */
export function replyServiceResult<T>(
  ctx: AppContext,
  result: ServiceResult<T>,
  successMsg?: string
): void {
  if (result.ok === false) {
    ctx.body = commons.resReturn(null, result.code, result.message);
    return;
  }
  ctx.body = commons.resReturn(
    result.data,
    0,
    successMsg !== undefined ? successMsg : undefined
  );
}

/** catch 块统一 402 错误响应 */
export function replyException(ctx: AppContext, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  ctx.body = commons.resReturn(null, 402, message);
}
