// @ts-nocheck
/**
 * 第三方登录（qsso，按 WEBCONFIG.integrations / YAPI_INTEGRATIONS 配置启用）
 */
import request from "request";
import yapi from "../runtime.js";

type QssoOptions = {
  loginUrl: string;
  emailPostfix: string;
};

/** 从 WEBCONFIG.integrations 解析 qsso 配置 */
function getQssoOptions(): QssoOptions | null {
  const integrations = yapi.WEBCONFIG.integrations;
  if (!Array.isArray(integrations)) {
    return null;
  }
  for (const item of integrations) {
    const name = typeof item === "string" ? item : item && item.name;
    if (name !== "qsso") {
      continue;
    }
    const options = typeof item === "object" && item.options ? item.options : {};
    if (!options.loginUrl || !options.emailPostfix) {
      return null;
    }
    return options as QssoOptions;
  }
  return null;
}

/**
 * 第三方 token 登录（loginByToken）
 * @param ctx 请求上下文
 */
export function thirdLoginByToken(ctx) {
  const qsso = getQssoOptions();
  if (!qsso) {
    return Promise.reject(
      new Error("未配置 qsso 第三方登录（integrations 中需包含 qsso 及 options）")
    );
  }
  const token = ctx.request.body.token || ctx.request.query.token;
  return new Promise((resolve, reject) => {
    request(qsso.loginUrl + token, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const result = JSON.parse(body);
        if (result && result.ret === true) {
          const ret = {
            email: result.userId + qsso.emailPostfix,
            username: result.data.userInfo.name,
          };
          const next = ctx.request.body.next;
          if (next) {
            ret.next = next;
          }
          resolve(ret);
          return;
        }
        reject(result);
        return;
      }
      reject(error);
    });
  });
}
