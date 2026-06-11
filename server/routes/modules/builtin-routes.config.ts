// @ts-nocheck
/**
 * 内置能力 HTTP 路由表（仅配置，供单测引用，避免拉取 controllers）
 */

/** @type {import("../types.js").RouteAction[]} */
export const advancedMockHttpRoutes = [
  { action: "get", path: "", method: "get" },
  { action: "save", path: "", method: "post" },
  { action: "saveCase", path: "cases", method: "post" },
  { action: "getCase", path: "cases/detail", method: "get" },
  { action: "listCases", path: "cases", method: "get" },
  { action: "deleteCase", path: "cases/delete", method: "post" },
  { action: "hideCase", path: "cases/hide", method: "post" },
];

/** @type {import("../types.js").RouteAction[]} */
export const statisticsHttpRoutes = [
  { action: "getSummary", path: "summary", method: "get" },
  { action: "getMockLog", path: "mock-log", method: "get" },
  { action: "getSystem", path: "system", method: "get" },
  { action: "getGroups", path: "groups", method: "get" },
];

/** @type {import("../types.js").RouteAction[]} */
export const exportHttpRoutes = [
  { action: "exportData", path: "data", method: "get" },
  { action: "exportData", path: "swagger", method: "get" },
];

/** @type {import("../types.js").RouteAction[]} */
export const wikiHttpRoutes = [
  { action: "get", path: "", method: "get" },
  { action: "save", path: "", method: "post" },
];

/** @type {import("../types.js").RouteAction[]} */
export const swaggerSyncHttpRoutes = [
  { action: "get", path: "", method: "get" },
  { action: "save", path: "", method: "post" },
];
