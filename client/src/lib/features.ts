/**
 * 内置功能入口（统计、Wiki、导入导出等）
 */
export const featureRoutes: Record<
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
  "export-swagger2-data": { label: "Swagger2 导出", note: "项目设置 → 环境与数据" },
  "advanced-mock": { label: "高级 Mock", note: "服务端 Mock 规则" },
  "swagger-auto-sync": { label: "Swagger 自动同步", note: "服务端定时任务" },
};

/** 始终启用的内置功能名 */
export const enabledFeatureNames = Object.keys(featureRoutes);
