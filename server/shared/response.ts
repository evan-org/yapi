/**
 * API 响应契约统一出口（shared 层）
 *
 * 业务代码优先从此处 import，底层实现在 lib/api-response.ts
 */
export {
  ApiCode,
  DEFAULT_SUCCESS_MSG,
  RAW_RESPONSE_PATH_PREFIXES,
  isApiEnvelope,
  isRawResponsePath,
  isSuccess,
  createResponse,
  success,
  fail,
  normalizeEnvelope,
  finalizeResponse,
} from "../lib/api-response.js";

export { default } from "../lib/api-response.js";
