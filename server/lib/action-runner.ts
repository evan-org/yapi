// @ts-nocheck
/**
 * 控制器 Action 执行器
 * 负责：实例化控制器 → init 鉴权 → 参数校验 → 调用 action → 响应信封
 */
import yapi from "../runtime.js";
import apiResponse from "../common/apiResponse.js";

/**
 * 将控制器方法注册为 HTTP 或 WebSocket 路由
 *
 * @param {import("./bind-routes.js").default} router
 * @param {string} baseurl - 路径前缀，通常为 `/api`
 * @param {new (ctx: import("../types/app-context.js").AppContext) => object} routerController
 * @param {string} action - 控制器方法名
 * @param {string} path - 相对路径（不含 baseurl）
 * @param {string} method - HTTP 方法或 `all`
 * @param {boolean} [ws] - 是否为 WebSocket
 */
export function createAction(
  router,
  baseurl,
  routerController,
  action,
  path,
  method,
  ws
) {
  let routeMethod = (method || "get").toLowerCase();
  if (routeMethod === "delete") {
    routeMethod = "del";
  }
  if (typeof router[routeMethod] !== "function") {
    throw new Error(`Unsupported route method: ${method}`);
  }
  const fullPath = baseurl + path;
  router[routeMethod](fullPath, async (ctx) => {
    const inst = new routerController(ctx);
    try {
      await inst.init(ctx);
      ctx.params = Object.assign(
        {},
        ctx.request.query,
        ctx.request.body,
        ctx.params
      );
      if (
        inst.schemaMap &&
        typeof inst.schemaMap === "object" &&
        inst.schemaMap[action]
      ) {
        const validResult = yapi.commons.validateParams(
          inst.schemaMap[action],
          ctx.params
        );
        if (!validResult.valid) {
          return (ctx.body = yapi.commons.resReturn(
            null,
            apiResponse.ApiCode.BAD_REQUEST,
            validResult.message
          ));
        }
      }
      if (inst.$auth === true) {
        await inst[action].call(inst, ctx);
        if (!ws && ctx.body !== undefined) {
          const reqPath = ctx.path || fullPath;
          ctx.body = apiResponse.finalizeResponse(reqPath, ctx.body);
        }
      } else if (ws === true) {
        ctx.ws.send(
          JSON.stringify(
            apiResponse.fail(apiResponse.ApiCode.NOT_LOGIN, "请登录...")
          )
        );
      } else {
        ctx.body = yapi.commons.resReturn(
          null,
          apiResponse.ApiCode.NOT_LOGIN,
          "请登录..."
        );
      }
    } catch (err) {
      if (ws === true) {
        ctx.ws.send(
          JSON.stringify(
            apiResponse.fail(apiResponse.ApiCode.SERVER_ERROR, "服务器出错...")
          )
        );
      } else {
        ctx.body = yapi.commons.resReturn(
          null,
          apiResponse.ApiCode.SERVER_ERROR,
          "服务器出错..."
        );
      }
      yapi.commons.log(err, "error");
    }
  });
}
