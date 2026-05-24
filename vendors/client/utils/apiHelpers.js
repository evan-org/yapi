/**
 * 前端 API 响应解析工具（与 common/apiResponse 契约一致）
 */
const { ApiCode, isApiEnvelope, isSuccess } = require("common/apiResponse");

/**
 * 从 axios 响应中取出业务 body
 * @param {import('axios').AxiosResponse} axiosResponse
 */
export function getApiBody(axiosResponse) {
  if (!axiosResponse || !axiosResponse.data) {
    return null;
  }
  return axiosResponse.data;
}

/**
 * 是否业务成功（errcode === 0）
 * @param {import('axios').AxiosResponse|{ errcode: number }} res
 */
export function isApiOk(res) {
  const body = res && res.data !== undefined && res.status !== undefined ? res.data : res;
  return isSuccess(body);
}

/**
 * 取 data 字段；失败时返回 null
 * @param {import('axios').AxiosResponse} axiosResponse
 */
export function getApiData(axiosResponse) {
  const body = getApiBody(axiosResponse);
  if (!isSuccess(body)) {
    return null;
  }
  return body.data;
}

/**
 * 兼容旧代码：判断 errcode 是否为成功
 * @param {{ errcode?: number }} body
 */
export function isErrcodeOk(body) {
  if (!body || typeof body.errcode !== "number") {
    return false;
  }
  return body.errcode === ApiCode.SUCCESS;
}

export { ApiCode, isApiEnvelope, isSuccess };
