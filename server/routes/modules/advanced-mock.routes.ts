// @ts-nocheck
/**
 * 高级 Mock HTTP 路由
 * 基础路径: /api/advanced-mock/
 */
import advancedMockController from "../../controllers/advancedMock.js";
import { registerModuleRoutes } from "../register-routes.js";
import { advancedMockHttpRoutes } from "./builtin-routes.config.js";

export { advancedMockHttpRoutes } from "./builtin-routes.config.js";

/**
 * 注册高级 Mock 路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerAdvancedMockRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: advancedMockController,
    prefix: "/advanced-mock",
    routes: advancedMockHttpRoutes,
  });
}
