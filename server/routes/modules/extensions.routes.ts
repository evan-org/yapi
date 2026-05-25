// @ts-nocheck
/**
 * 内置扩展 HTTP 路由（/api/extensions/*）
 */
import advMockController from "../../controllers/advMock.js";
import statisticsController from "../../controllers/statistics.js";
import wikiController from "../../controllers/wiki.js";
import exportPluginController from "../../controllers/exportPlugin.js";
import exportSwaggerController from "../../controllers/exportSwagger.js";
import swaggerSyncController from "../../controllers/swaggerSync.js";
import { registerModuleRoutes } from "../register-routes.js";
import {
  EXTENSIONS_ROUTE_PREFIX,
  extensionHttpRoutes,
} from "./extension-routes.config.js";

export {
  EXTENSIONS_ROUTE_PREFIX,
  extensionHttpRoutes,
} from "./extension-routes.config.js";

/**
 * 注册内置扩展 HTTP 路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerExtensionRoutes(binder) {
  const prefix = EXTENSIONS_ROUTE_PREFIX;

  registerModuleRoutes(binder, {
    controller: advMockController,
    prefix,
    routes: extensionHttpRoutes.filter((r) => r.path.startsWith("advanced-mock")),
  });
  registerModuleRoutes(binder, {
    controller: statisticsController,
    prefix,
    routes: extensionHttpRoutes.filter((r) => r.path.startsWith("statistics")),
  });
  registerModuleRoutes(binder, {
    controller: wikiController,
    prefix,
    routes: extensionHttpRoutes.filter((r) => r.path === "wiki"),
  });
  registerModuleRoutes(binder, {
    controller: exportPluginController,
    prefix,
    routes: [{ action: "exportData", path: "export/data", method: "get" }],
  });
  registerModuleRoutes(binder, {
    controller: exportSwaggerController,
    prefix,
    routes: [{ action: "exportData", path: "export/swagger", method: "get" }],
  });
  registerModuleRoutes(binder, {
    controller: swaggerSyncController,
    prefix,
    routes: extensionHttpRoutes.filter((r) => r.path.startsWith("swagger-sync")),
  });
}
