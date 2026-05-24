/**
 * 统一 HTTP 客户端：对接 YApi 标准响应 { errcode, errmsg, data }
 */
import axios from "axios";

const {
  ApiCode,
  isApiEnvelope,
  isSuccess,
  isRawResponsePath
} = require("common/apiResponse");

/** 解析请求完整路径，用于判断是否跳过 JSON 信封校验 */
function resolveApiPath(config) {
  const url = (config && config.url) || "";
  if (url.indexOf("/api/") === 0) {
    return url.split("?")[0];
  }
  const base = (config && config.baseURL) || "";
  const joined = `${base}${url}`.replace(/\/+/g, "/");
  if (joined.indexOf("/api/") === 0) {
    return joined.split("?")[0];
  }
  return `/api${url.startsWith("/") ? url : `/${url}`}`.split("?")[0];
}

/**
 * 为 axios 实例挂载响应拦截器
 * @param {import('axios').AxiosInstance} instance
 */
function attachApiInterceptors(instance) {
  instance.interceptors.response.use(
    (response) => {
      const path = resolveApiPath(response.config);
      if (isRawResponsePath(path)) {
        return response;
      }
      const contentType = response.headers && response.headers["content-type"];
      if (contentType && contentType.indexOf("application/json") === -1) {
        return response;
      }
      const body = response.data;
      if (!isApiEnvelope(body)) {
        console.warn("[apiClient] 非标准 JSON 响应:", path, body);
        return response;
      }
      // 未登录：交由业务层处理（如跳转登录页），不弹全局错误
      if (body.errcode === ApiCode.NOT_LOGIN) {
        return response;
      }
      if (!isSuccess(body)) {
        const error = new Error(body.errmsg || "请求失败");
        error.errcode = body.errcode;
        error.apiData = body.data;
        error.response = response;
        return Promise.reject(error);
      }
      return response;
    },
    (error) => {
      if (error && error.response) {
        const { status, config } = error.response;
        const path = resolveApiPath(config);
        const body = error.response.data;
        if (isApiEnvelope(body)) {
          error.message = body.errmsg || error.message;
          error.errcode = body.errcode;
          error.apiData = body.data;
        } else {
          switch (status) {
            case 400:
              error.message = "请求错误";
              break;
            case 401:
              error.message = "未授权，请登录";
              break;
            case 403:
              error.message = "拒绝访问";
              break;
            case 404:
              error.message = `请求地址出错: ${path}`;
              break;
            case 500:
              error.message = "服务器内部错误";
              break;
            default:
              break;
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 1000 * 60
});

attachApiInterceptors(apiClient);
attachApiInterceptors(axios);

export { ApiCode, isApiEnvelope, isSuccess, resolveApiPath };
export default apiClient;
