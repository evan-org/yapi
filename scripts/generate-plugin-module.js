/**
 * 根据 server/config.json 生成 client 插件注册表（ESM 加载 server/common/*.ts）
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const repoRoot = path.join(__dirname, "..");
const serverRoot = path.join(repoRoot, "server");
const outputFile = path.join(repoRoot, "client", "src", "lib", "plugins", "registry.ts");

async function loadServerModules() {
  const pluginUrl = pathToFileURL(path.join(serverRoot, "common/plugin.ts")).href;
  const configUrl = pathToFileURL(path.join(serverRoot, "common/config.ts")).href;
  const pluginMod = await import(pluginUrl);
  const configMod = await import(configUrl);
  return {
    initPlugins: pluginMod.initPlugins,
    systemConfigPlugin: configMod.default.exts,
  };
}

/**
 * 收集已启用的插件名（含 server 或历史 client 标记）
 */
function collectEnabledPluginNames(configPlugin, type, initPlugins) {
  const names = [];
  if (!configPlugin || !Array.isArray(configPlugin) || !configPlugin.length) {
    return names;
  }
  const initialized = initPlugins(configPlugin, type);
  initialized.forEach((plugin) => {
    if (plugin.enable !== false && (plugin.server || plugin.client)) {
      names.push(plugin.name);
    }
  });
  return names;
}

async function generate() {
  const { initPlugins, systemConfigPlugin } = await loadServerModules();

  let configPlugins = [];
  const configPath = path.join(serverRoot, "config.json");
  if (fs.existsSync(configPath)) {
    configPlugins = JSON.parse(fs.readFileSync(configPath, "utf8")).plugins || [];
  }

  const fromConfig = collectEnabledPluginNames(configPlugins, "plugin", initPlugins);
  const fromExts = collectEnabledPluginNames(systemConfigPlugin, "ext", initPlugins);
  const allNames = [...new Set([...fromConfig, ...fromExts])];

  const body = `/**
 * 自动生成：npm run predev / prebuild 会重新生成 enabledPluginNames
 * 插件业务能力由 server/exts 提供，Next 通过路由与项目设置页接入
 */
export const enabledPluginNames: string[] = ${JSON.stringify(allNames, null, 2)};

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
`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, body, "utf8");
  console.log(`[generate-plugin-registry] 已写入 ${outputFile} (${allNames.length} 个插件)`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
