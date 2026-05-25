// @ts-nocheck
/**
 * open 模块 HTTP 路由
 * 基础路径: /api/open/
 */
import openController from "../../controllers/open.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "projectInterfaceData", path: "project_interface_data", method: "get" },
  { action: "runAutoTest", path: "run_auto_test", method: "get" },
  { action: "importData", path: "import_data", method: "post" },
];

/**
 * 注册 open 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerOpenRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: openController,
    prefix: "/open/",
    routes,
  });
}
