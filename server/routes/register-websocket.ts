// @ts-nocheck
/**
 * WebSocket 路由注册（内置 + 插件钩子）
 */
import yapi from "../runtime.js";
import interfaceController from "../controllers/interface.js";
import { createAction } from "../utils/commons.js";

const API_BASE = "/api";
const pluginWsPaths = [];

/**
 * 注册插件 WebSocket 路由
 * @param {import('../lib/bind-routes.js').default} binder
 * @param {{ path: string, controller: object, action: string, method?: string }} config
 */
function registerPluginWsRoute(binder, config) {
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

/**
 * 初始化 WebSocket 路由绑定器
 * @param {import('../lib/bind-routes.js').default} binder
 */
export function setupWebSocketBinder(binder) {
  createAction(
    binder,
    API_BASE,
    interfaceController,
    "solveConflict",
    "/interface/solve_conflict",
    "get",
    true
  );
  yapi.emitHookSync("add_ws_router", (config) =>
    registerPluginWsRoute(binder, config)
  );
}
