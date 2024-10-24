"use client"
/**
 * form
 * time
 * http.js
 */
import axios from "axios";
import { v5 as uuidv5 } from "uuid";
import { setCancelToken, clearCancelToken } from "@/shared/cancelToken.js";
import { getToken, getUserId, removeAccount } from "@/shared/auth.js";
// import {setCancelToken, clearCancelToken} from "./cancelToken.js";
// 给每个API生成唯一的Hash
function generateKey(config) {
  return JSON.stringify({
    baseURL: config.baseURL,
    method: config.method,
    url: config.url,
    params: config.params,
    data: config.data
  });
}
// create an axios instance
const instance = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? "/api" : process.env["REACT_APP_BASE_URL"], // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 1000 * 60 // request timeout
})
// 取消请求
const pendingRequests = new Map();
export const addPendingRequests = (config) => {
  console.log(pendingRequests);
  const hashKey = uuidv5(generateKey(config), uuidv5.URL);
  console.log(hashKey);
  if (!pendingRequests.has(hashKey)) {
    // 添加请求
    pendingRequests.set(hashKey, config);
  }
}
export const clearPendingRequests = (config) => {
  const hashKey = uuidv5(generateKey(config), uuidv5.URL);
  if (pendingRequests.has(hashKey)) {
    // 取消请求
    pendingRequests.get(hashKey).controller.abort()
    // 删除当前数据
    pendingRequests.delete(hashKey);
  }
}
// request interceptor request拦截器
instance.interceptors.request.use((config) => {
  const cancelTokenSource = axios.CancelToken.source();
  // 生成hash
  const hashKey = uuidv5(generateKey(config), uuidv5.URL);
  // 取消重复请求
  clearCancelToken(hashKey);
  // config设置cancelToken
  config.cancelToken = cancelTokenSource.token;
  // 记录cancelToken
  setCancelToken(hashKey, cancelTokenSource);
  // 设置默认Hash
  config.headers["User-Hash"] = hashKey;
  // 有token 设置uid 和 token
  if (getToken()) {
    config.headers["Authorization"] = `Bearer ${getToken()}`;
    config.headers["User-Id"] = `${getUserId()}`;
  }
  //
  console.debug(`${hashKey} : `, generateKey(config));
  return config
}, (error) => {
  console.log(error) // for debug
  return Promise.reject(error)
})
// response interceptor response拦截器
instance.interceptors.response.use((response) => {
  const { errcode, message } = response.data;
  if ([0, "0"].includes(errcode)) {
    return response
  } else if ([40011, "40011"].includes(errcode)) {
    // Toast.show({ content: message }) 未登录
    // window.location.href = "/login";
    return Promise.reject(response)
  } else {
    return Promise.reject(message || "Error")
  }
}, (error) => {
  if (axios.isCancel(error)) {
    // 请求被取消的处理逻辑
    console.warn("isCancel: 请求被取消");
  }
  if (error && error.response) {
    const { status } = error.response;
    switch (status) {
      case 400:
        error.message = "请求错误";
        break
      case 401:
        error.message = "未授权，请登录";
        removeAccount();
        break
      case 403:
        error.message = "拒绝访问";
        break
      case 404:
        error.message = `请求地址出错: ${error.response.config.url}`;
        break
      case 408:
        error.message = "请求超时";
        break
      case 500:
        error.message = "网络异常，请刷新重试！";
        break
      case 501:
        error.message = "网络异常，请刷新重试！";
        break
      case 502:
        error.message = "网络异常，请刷新重试！";
        break
      case 503:
        error.message = "服务不可用";
        break
      case 504:
        error.message = "网关超时";
        break
      case 505:
        error.message = "HTTP版本不受支持";
        break
      default:
        break
    }
    // Toast.show({ content: error.message })
    return Promise.reject(error)
    //
  } else {
    // Toast.show({ content: error.message })
    return Promise.reject(error)
  }
})
export default instance
