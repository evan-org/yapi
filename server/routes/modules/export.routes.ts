// @ts-nocheck
/**
 * 接口/项目导出 HTTP 路由
 * 基础路径: /api/export/
 */
import exportDataController from "../../controllers/exportData.js";
import exportSwaggerController from "../../controllers/exportSwagger.js";
import { registerModuleRoutes } from "../register-routes.js";
import { exportHttpRoutes } from "./builtin-routes.config.js";

export { exportHttpRoutes } from "./builtin-routes.config.js";

/**
 * 注册导出路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerExportRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: exportDataController,
    prefix: "/export",
    routes: [{ action: "exportData", path: "data", method: "get" }],
  });
  registerModuleRoutes(binder, {
    controller: exportSwaggerController,
    prefix: "/export",
    routes: [{ action: "exportData", path: "swagger", method: "get" }],
  });
}
