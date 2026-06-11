// @ts-nocheck
/**
 * log 模块 HTTP 路由
 * 基础路径: /api/log/
 */
import logController from "../../controllers/log.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "list", path: "list", method: "get" },
  { action: "listByUpdate", path: "list_by_update", method: "post" },
];

/**
 * 注册 log 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerLogRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: logController,
    prefix: "/log/",
    routes,
  });
}
