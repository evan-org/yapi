// @ts-nocheck
/**
 * WebSocket 路由聚合
 */
import yapi from "../../runtime.js";
import RouteBinder from "../../lib/bind-routes.js";
import appContext from "../../lib/context.js";
import interfaceController from "../../controllers/interface.js";
import { createAction } from "../../lib/action-runner.js";
import { API_BASE } from "../register-routes.js";

const binder = new RouteBinder();
const pluginWsPaths = [];

/**
 * 注册插件 WebSocket 路由
 * @param {{ path: string, controller: object, action: string, method?: string }} config
 */
function registerPluginWsRoute(config) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error("Plugin Route config Error");
  }
  const method = config.method || "GET";
  const routerPath = "/ws_plugin/" + config.path;
  if (pluginWsPaths.includes(routerPath)) {
    throw new Error("Plugin Route path conflict, please try rename the path");
  }
  pluginWsPaths.push(routerPath);
  createAction(
    binder,
    API_BASE,
    config.controller,
    config.action,
    routerPath,
    method,
    true
  );
}

createAction(
  binder,
  API_BASE,
  interfaceController,
  "solveConflict",
  "/interface/solve_conflict",
  "get",
  true
);
yapi.emitHookSync("add_ws_router", registerPluginWsRoute);

/**
 * 挂载 WebSocket 路由
 * @param {import('hono').Hono} app
 * @param {Function} upgradeWebSocket
 */
export function mountWebSocketRoutes(app, upgradeWebSocket) {
  binder.mountWebSocketToHono(app, upgradeWebSocket, appContext);
}
