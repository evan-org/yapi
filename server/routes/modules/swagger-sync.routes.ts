// @ts-nocheck
/**
 * Swagger 自动同步 HTTP 路由
 * 基础路径: /api/swagger-sync/
 */
import swaggerSyncController from "../../controllers/swaggerSync.js";
import { registerModuleRoutes } from "../register-routes.js";
import { swaggerSyncHttpRoutes } from "./builtin-routes.config.js";

export { swaggerSyncHttpRoutes } from "./builtin-routes.config.js";

/**
 * 注册 Swagger 同步路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerSwaggerSyncRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: swaggerSyncController,
    prefix: "/swagger-sync",
    routes: swaggerSyncHttpRoutes,
  });
}
