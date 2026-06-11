// @ts-nocheck
/**
 * 系统统计 HTTP 路由
 * 基础路径: /api/statistics/
 */
import statisticsController from "../../controllers/statistics.js";
import { registerModuleRoutes } from "../register-routes.js";
import { statisticsHttpRoutes } from "./builtin-routes.config.js";

export { statisticsHttpRoutes } from "./builtin-routes.config.js";

/**
 * 注册统计路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerStatisticsRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: statisticsController,
    prefix: "/statistics",
    routes: statisticsHttpRoutes,
  });
}
