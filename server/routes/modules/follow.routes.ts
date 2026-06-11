// @ts-nocheck
/**
 * follow 模块 HTTP 路由
 * 基础路径: /api/follow/
 */
import followController from "../../controllers/follow.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "list", path: "list", method: "get" },
  { action: "add", path: "add", method: "post" },
  { action: "del", path: "del", method: "post" },
];

/**
 * 注册 follow 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerFollowRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: followController,
    prefix: "/follow/",
    routes,
  });
}
