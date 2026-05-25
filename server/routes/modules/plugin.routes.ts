// @ts-nocheck
/**
 * 原内置插件 HTTP 路由（保持 /api/plugin/* 路径，兼容前端）
 */
import advMockController from "../../controllers/advMock.js";
import statisticsController from "../../controllers/statistics.js";
import wikiController from "../../controllers/wiki.js";
import exportPluginController from "../../controllers/exportPlugin.js";
import exportSwaggerController from "../../controllers/exportSwagger.js";
import swaggerSyncController from "../../controllers/swaggerSync.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const pluginRoutes = [
  { action: "getMock", path: "advmock/get", method: "get" },
  { action: "upMock", path: "advmock/save", method: "post" },
  { action: "saveCase", path: "advmock/case/save", method: "post" },
  { action: "getCase", path: "advmock/case/get", method: "get" },
  { action: "list", path: "advmock/case/list", method: "get" },
  { action: "delCase", path: "advmock/case/del", method: "post" },
  { action: "hideCase", path: "advmock/case/hide", method: "post" },
  { action: "getStatisCount", path: "statismock/count", method: "get" },
  { action: "getMockDateList", path: "statismock/get", method: "get" },
  { action: "getSystemStatus", path: "statismock/get_system_status", method: "get" },
  { action: "groupDataStatis", path: "statismock/group_data_statis", method: "get" },
  { action: "getWikiDesc", path: "wiki_desc/get", method: "get" },
  { action: "uplodaWikiDesc", path: "wiki_desc/up", method: "post" },
  { action: "exportData", path: "export", method: "get" },
  { action: "exportData", path: "exportSwagger", method: "get" },
  { action: "getSync", path: "autoSync/get", method: "get" },
  { action: "upSync", path: "autoSync/save", method: "post" },
];

/**
 * 注册内置扩展 HTTP 路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerPluginRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: advMockController,
    prefix: "/plugin/",
    routes: pluginRoutes.filter((r) => r.path.startsWith("advmock")),
  });
  registerModuleRoutes(binder, {
    controller: statisticsController,
    prefix: "/plugin/",
    routes: pluginRoutes.filter((r) => r.path.startsWith("statismock")),
  });
  registerModuleRoutes(binder, {
    controller: wikiController,
    prefix: "/plugin/",
    routes: pluginRoutes.filter((r) => r.path.startsWith("wiki_desc")),
  });
  registerModuleRoutes(binder, {
    controller: exportPluginController,
    prefix: "/plugin/",
    routes: [{ action: "exportData", path: "export", method: "get" }],
  });
  registerModuleRoutes(binder, {
    controller: exportSwaggerController,
    prefix: "/plugin/",
    routes: [{ action: "exportData", path: "exportSwagger", method: "get" }],
  });
  registerModuleRoutes(binder, {
    controller: swaggerSyncController,
    prefix: "/plugin/",
    routes: pluginRoutes.filter((r) => r.path.startsWith("autoSync")),
  });
}
