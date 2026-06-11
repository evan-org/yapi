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

export { API_BASE };
