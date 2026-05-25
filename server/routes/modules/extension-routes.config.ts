// @ts-nocheck
/**
 * 内置扩展 HTTP 路由表（仅配置，供注册与测试引用，避免拉取 controllers）
 */

/** @type {import("../types.js").RouteAction[]} */
export const extensionHttpRoutes = [
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
