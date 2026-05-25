// @ts-nocheck
/**
 * 内置扩展 HTTP 路由表（仅配置，供注册与测试引用，避免拉取 controllers）
 */

/** 扩展模块 URL 前缀（挂载后为 /api/extensions/...） */
export const EXTENSIONS_ROUTE_PREFIX = "/extensions/";

/** @type {import("../types.js").RouteAction[]} */
export const extensionHttpRoutes = [
  { action: "getMock", path: "advanced-mock", method: "get" },
  { action: "upMock", path: "advanced-mock", method: "post" },
  { action: "saveCase", path: "advanced-mock/cases", method: "post" },
  { action: "getCase", path: "advanced-mock/cases/detail", method: "get" },
  { action: "list", path: "advanced-mock/cases", method: "get" },
  { action: "delCase", path: "advanced-mock/cases/delete", method: "post" },
  { action: "hideCase", path: "advanced-mock/cases/hide", method: "post" },
  { action: "getStatisCount", path: "statistics/summary", method: "get" },
  { action: "getMockDateList", path: "statistics/mock-log", method: "get" },
  { action: "getSystemStatus", path: "statistics/system", method: "get" },
  { action: "groupDataStatis", path: "statistics/groups", method: "get" },
  { action: "getWikiDesc", path: "wiki", method: "get" },
  { action: "uplodaWikiDesc", path: "wiki", method: "post" },
  { action: "exportData", path: "export/data", method: "get" },
  { action: "exportData", path: "export/swagger", method: "get" },
  { action: "getSync", path: "swagger-sync", method: "get" },
  { action: "upSync", path: "swagger-sync", method: "post" },
];
