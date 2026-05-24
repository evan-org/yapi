import { message } from "antd";

const { ApiCode } = require("common/apiResponse");

/**
 * Redux 异步 Action 全局错误提示
 * - 网络/axios 错误：action.error === true
 * - 业务错误：由 apiClient 拦截器 reject，或 payload.data.errcode !== 0
 */
export default () => (next) => (action) => {
  console.log("messageMiddleware =====>", action);
  if (!action) {
    return;
  }
  if (action.error) {
    const err = action.payload;
    const msg =
      (err && err.message) ||
      (err && err.errmsg) ||
      "服务器错误";
    message.error(msg);
    return next(action);
  }
  const body = action.payload && action.payload.data;
  if (
    body &&
    typeof body.errcode === "number" &&
    body.errcode !== ApiCode.SUCCESS &&
    body.errcode !== ApiCode.NOT_LOGIN
  ) {
    message.error(body.errmsg || "请求失败");
    const error = new Error(body.errmsg || "请求失败");
    error.errcode = body.errcode;
    throw error;
  }
  return next(action);
};
