// @ts-nocheck
/**
 * YApi 统一 API 响应契约（前后端共用）
 * 标准 JSON 响应：{ errcode, errmsg, data, ...extensions }
 */

/** @typedef {{ errcode: number, errmsg: string, data: * }} ApiEnvelope */

/**
 * 业务状态码（与历史 YApi 兼容，并补充语义化别名）
 */
const ApiCode = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  /** 参数校验失败 */
  VALIDATION_ERROR: 40022,
  /** 未登录 / 登录态失效（历史码，前端 middleware 会静默） */
  NOT_LOGIN: 40011,
  /** 无效 token */
  INVALID_TOKEN: 42014,
  /** 无权限 */
  PERMISSION_DENIED: 40033,
  /** 服务器内部错误 */
  SERVER_ERROR: 50000
};

/** 默认成功文案 */
const DEFAULT_SUCCESS_MSG = "成功！";

/**
 * 不参与 JSON 信封包装的路径前缀（二进制、开放接口原始输出等）
 */
const RAW_RESPONSE_PATH_PREFIXES = [
  "/api/user/avatar",
  "/api/interface/download_crx",
  "/api/interface/schema2json",
  "/api/open/run_auto_test",
  "/api/open/project_interface_data"
];

/**
 * @param {*} value
 * @returns {boolean}
 */
function isApiEnvelope(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Buffer.isBuffer(value) &&
    typeof value.errcode === "number"
  );
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isRawResponsePath(path) {
  if (!path || typeof path !== "string") {
    return false;
  }
  return RAW_RESPONSE_PATH_PREFIXES.some((prefix) => path.indexOf(prefix) === 0);
}

/**
 * @param {number} errcode
 * @returns {string}
 */
function defaultMessage(errcode) {
  return errcode === ApiCode.SUCCESS ? DEFAULT_SUCCESS_MSG : "";
}

/**
 * 构造标准 API 响应体
 * @param {*} data
 * @param {number} [errcode=0]
 * @param {string} [errmsg]
 * @returns {ApiEnvelope}
 */
function createResponse(data, errcode, errmsg) {
  const code = typeof errcode === "number" ? errcode : ApiCode.SUCCESS;
  return {
    errcode: code,
    errmsg: errmsg || defaultMessage(code) || "操作失败",
    data: data === undefined ? null : data
  };
}

/**
 * 成功响应
 * @param {*} [data]
 * @param {string} [errmsg]
 */
function success(data, errmsg) {
  return createResponse(data, ApiCode.SUCCESS, errmsg || DEFAULT_SUCCESS_MSG);
}

/**
 * 失败响应
 * @param {number} errcode
 * @param {string} errmsg
 * @param {*} [data]
 */
function fail(errcode, errmsg, data) {
  return createResponse(data === undefined ? null : data, errcode, errmsg);
}

/**
 * @param {ApiEnvelope|*} body
 * @returns {boolean}
 */
function isSuccess(body) {
  return isApiEnvelope(body) && body.errcode === ApiCode.SUCCESS;
}

/**
 * 规范化响应体，保留 login/status 等扩展字段（ladp、canRegister、colData 等）
 * @param {*} body
 * @returns {ApiEnvelope|*}
 */
function normalizeEnvelope(body) {
  if (!isApiEnvelope(body)) {
    return body;
  }
  const normalized = createResponse(
    body.data === undefined ? null : body.data,
    body.errcode,
    body.errmsg || defaultMessage(body.errcode)
  );
  Object.keys(body).forEach((key) => {
    if (key !== "errcode" && key !== "errmsg" && key !== "data") {
      normalized[key] = body[key];
    }
  });
  return normalized;
}

/**
 * 根据请求路径决定是否包装为统一信封
 * @param {string} path
 * @param {*} body
 * @returns {*}
 */
function finalizeResponse(path, body) {
  if (isRawResponsePath(path)) {
    return body;
  }
  if (body === undefined || body === null) {
    return success(null);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (typeof body === "string") {
    return body;
  }
  if (isApiEnvelope(body)) {
    return normalizeEnvelope(body);
  }
  return success(body);
}

module.exports = {
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
  finalizeResponse
};
