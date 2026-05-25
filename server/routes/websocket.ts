// @ts-nocheck
/**
 * WebSocket 路由注册（/api/*）
 */
import RouteBinder from "../lib/bind-routes.js";
import appContext from "../lib/context.js";
import interfaceController from "../controllers/interface.js";
import yapi from "../runtime.js";
import { createAction } from "../utils/commons.js";

const binder = new RouteBinder();
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
  createAction(binder, "/api", config.controller, config.action, routerPath, method, true);
}

createAction(
  binder,
  "/api",
  interfaceController,
  "solveConflict",
  "/interface/solve_conflict",
  "get",
  true
);
yapi.emitHookSync("add_ws_router", addPluginRouter);

/**
 * 将 WebSocket 路由挂载到 Hono
 * @param {import('hono').Hono} app
 * @param {Function} upgradeWebSocket
 */
export function mountWebSocketRoutes(app, upgradeWebSocket) {
  binder.mountWebSocketToHono(app, upgradeWebSocket, appContext);
}
