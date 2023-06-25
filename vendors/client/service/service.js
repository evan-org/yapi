import axios from "axios";
import { getToken, removeInfo, removeToken } from "@/utils/auth.js";
// create an axios instance
const service = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? "/api" : process.env["VITE_REACT_APP_BASE_URL"], // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 1000 * 60 // request timeout
})
//
// 取消请求
let httpList = []
const removeHttp = (config) => {
  let index = httpList.findIndex((v) => v.url === config.url && v.method === config.method)
  if (index >= 0) {
    // 取消请求
    httpList[index].controller.abort()
    // 删除当前数据
    httpList.splice(index, 1)
  }
}
// request interceptor request拦截器
service.interceptors.request.use((config) => {
  // 取消操作
  removeHttp(config);
  // 在push之前遍历数组找到相同的请求取消掉
  const controller = new AbortController();
  config.signal = controller.signal; // 用来取消操作的key
  config.controller = controller; // 将控制器绑定到每个请求身上
  httpList.push({ ...config }); // 每次的请求加入到数组
  //
  if (getToken()) {
    config.headers["token"] = `${getToken()}`
  }
  return config
}, (error) => {
  console.log(error) // for debug
  return Promise.reject(error)
})
// response interceptor response拦截器
service.interceptors.response.use((response) => {
  const { code, message } = response.data;
  if ([0, "0"].includes(response.data.errcode)) {
    return response.data
  } else if ([40011, "40011"].includes(response.data.errcode)) {
    // Toast.show({ content: message }) 未登录
    return
  } else {
    return Promise.reject(new Error(message || "Error"))
  }
}, (error) => {
  if (error && error.response) {
    const { status } = error.response;
    switch (status) {
      case 400:
        error.message = "请求错误";
        break
      case 401:
        error.message = "未授权，请登录";
        removeToken();
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
export default service
