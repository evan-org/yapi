// @ts-nocheck
/**
 * 内置扩展 HTTP 路由表（仅配置，供注册与测试引用，避免拉取 controllers）
 */

/** 扩展模块 URL 前缀（挂载后为 /api/extensions/...） */
export const EXTENSIONS_ROUTE_PREFIX = "/extensions/";

/** @type {import("../types.js").RouteAction[]} */
export const extensionHttpRoutes = [
  { action: "get", path: "advanced-mock", method: "get" },
  { action: "save", path: "advanced-mock", method: "post" },
  { action: "saveCase", path: "advanced-mock/cases", method: "post" },
  { action: "getCase", path: "advanced-mock/cases/detail", method: "get" },
  { action: "listCases", path: "advanced-mock/cases", method: "get" },
  { action: "deleteCase", path: "advanced-mock/cases/delete", method: "post" },
  { action: "hideCase", path: "advanced-mock/cases/hide", method: "post" },
  { action: "getSummary", path: "statistics/summary", method: "get" },
  { action: "getMockLog", path: "statistics/mock-log", method: "get" },
  { action: "getSystem", path: "statistics/system", method: "get" },
  { action: "getGroups", path: "statistics/groups", method: "get" },
  { action: "get", path: "wiki", method: "get" },
  { action: "save", path: "wiki", method: "post" },
  { action: "exportData", path: "export/data", method: "get" },
  { action: "exportData", path: "export/swagger", method: "get" },
  { action: "get", path: "swagger-sync", method: "get" },
  { action: "save", path: "swagger-sync", method: "post" },
];
