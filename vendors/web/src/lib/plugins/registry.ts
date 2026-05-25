/**
 * 自动生成：npm run predev / prebuild 会重新生成 enabledPluginNames
 * 插件业务能力由服务端 exts 提供，Next 通过路由与项目设置页接入
 */
export const enabledPluginNames: string[] = [
  "advanced-mock",
  "import-swagger",
  "statistics",
  "export-data",
  "gen-services",
  "export-swagger2-data",
  "wiki",
  "swagger-auto-sync"
];

/** Next 端插件入口映射（与 enabledPluginNames 对应） */
export const pluginNextRoutes: Record<
  string,
  { label: string; path?: string; note?: string }
> = {
  statistics: { label: "系统统计", path: "/statistic" },
  wiki: { label: "项目 Wiki", path: "/project/:id/wiki" },
  "export-data": { label: "导出文档", note: "项目设置 → 环境与数据" },
  "import-yapi-json": { label: "YApi JSON 导入", note: "项目设置 → 导入" },
  "import-postman": { label: "Postman 导入", note: "项目设置 → 导入" },
  "import-har": { label: "HAR 导入", note: "项目设置 → 导入" },
  "import-swagger": { label: "Swagger 导入", note: "项目设置 → 导入" },
  "gen-services": { label: "代码生成", note: "全量导出 + gen-services API" },
  "export-swagger2-data": { label: "Swagger2 导出", note: "插件 API" },
  "advanced-mock": { label: "高级 Mock", note: "服务端 Mock 规则" },
  "swagger-auto-sync": { label: "Swagger 自动同步", note: "服务端定时任务" },
};

export type PluginRegistry = Record<
  string,
  { module: unknown; options: Record<string, unknown> | null }
>;

/** 旧 React 插件 UI 已移除；由 pluginNextRoutes 与设置页承接 */
export const pluginRegistry: PluginRegistry = {};
