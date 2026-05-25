// @ts-nocheck
import HttpRouter from "./utils/httpRouter.js";
import interfaceController from "./controllers/interface.js";
import yapi from "./yapi.js";
import { createAction } from "./utils/commons.js";
import koaCtx from "./adapter/koa-context.js";


const router = new HttpRouter();
let pluginsRouterPath = [];

/**
 * 注册插件 WebSocket 路由
 */
function addPluginRouter(config) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error("Plugin Route config Error");
  }
  let method = config.method || "GET";
  let routerPath = "/ws_plugin/" + config.path;
  if (pluginsRouterPath.indexOf(routerPath) > -1) {
    throw new Error("Plugin Route path conflict, please try rename the path");
  }
  pluginsRouterPath.push(routerPath);
  createAction(router, "/api", config.controller, config.action, routerPath, method, true);
}

createAction(router, "/api", interfaceController, "solveConflict", "/interface/solve_conflict", "get", true);
yapi.emitHookSync("add_ws_router", addPluginRouter);

/**
 * 将 WebSocket 路由注册到 Hono
 * @param {import('hono').Hono} app
 * @param {Function} upgradeWebSocket
 */
function registerWebSocket(app, upgradeWebSocket) {
  router.registerWsToHono(app, upgradeWebSocket, koaCtx);
}

export default registerWebSocket;
