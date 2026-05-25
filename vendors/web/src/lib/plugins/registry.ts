/**
 * 自动生成：npm run predev / prebuild 会重新生成，请勿手改
 * 插件 UI 迁移至 Next 后在此注册客户端模块
 */
export const enabledPluginNames: string[] = [
  "import-postman",
  "import-har",
  "advanced-mock",
  "import-swagger",
  "statistics",
  "export-data",
  "gen-services",
  "export-swagger2-data",
  "import-yapi-json",
  "wiki",
  "swagger-auto-sync"
];

export type PluginRegistry = Record<
  string,
  { module: unknown; options: Record<string, unknown> | null }
>;

/** 占位注册表，待各 exts 插件提供 Next 客户端入口后填充 */
export const pluginRegistry: PluginRegistry = {};
