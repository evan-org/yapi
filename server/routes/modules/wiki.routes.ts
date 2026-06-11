// @ts-nocheck
/**
 * 项目 Wiki HTTP 路由
 * 基础路径: /api/wiki/
 */
import wikiController from "../../controllers/wiki.js";
import { registerModuleRoutes } from "../register-routes.js";
import { wikiHttpRoutes } from "./builtin-routes.config.js";

export { wikiHttpRoutes } from "./builtin-routes.config.js";

/**
 * 注册 Wiki 路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerWikiRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: wikiController,
    prefix: "/wiki",
    routes: wikiHttpRoutes,
  });
}
