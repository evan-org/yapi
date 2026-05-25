// @ts-nocheck
/**
 * 路由注册工具：将模块路由表绑定到 RouteBinder
 */
import { createAction } from "../lib/action-runner.js";

const API_BASE = "/api";

/**
 * 注册单个业务模块的全部路由
 * @param {import('../lib/bind-routes.js').default} binder
 * @param {import('./types.js').ModuleRouteConfig} config
 */
export function registerModuleRoutes(binder, { controller, prefix, routes }) {
  for (const route of routes) {
    createAction(
      binder,
      API_BASE,
      controller,
      route.action,
      prefix + route.path,
      route.method
    );
  }
}

/**
 * 注册插件 HTTP 路由
 * @param {import('../lib/bind-routes.js').default} binder
 * @param {{ path: string, controller: object, action: string, method?: string, prefix?: string }} config
 * @param {string[]} registeredPaths - 已注册 path，用于冲突检测
 */
export function registerPluginRoute(binder, config, registeredPaths) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error("Plugin Route config Error");
  }
  const method = config.method || "GET";
  const routerPath = (config.prefix || "") + "/plugin/" + config.path;
  if (registeredPaths.includes(routerPath)) {
    throw new Error("Plugin Route path conflict, please try rename the path");
  }
  registeredPaths.push(routerPath);
  createAction(
    binder,
    API_BASE,
    config.controller,
    config.action,
    routerPath,
    method,
    false
  );
}

export { API_BASE };
