/**
 * 根据 config.json 生成 Next 前端插件注册表（web/src/lib/plugins/registry.ts）
 * 服务端插件仍由 server/plugin.js 加载，与此脚本无关
 */
const fs = require("fs");
const path = require("path");

const vendorsRoot = path.join(__dirname, "..");
const outputFile = path.join(vendorsRoot, "web", "src", "lib", "plugins", "registry.ts");

const commonLib = require(path.join(vendorsRoot, "common/plugin.js"));
const { exts: systemConfigPlugin } = require(path.join(vendorsRoot, "common/config"));

/**
 * 收集已启用且含 client 的插件名（Next 端后续按名动态加载）
 */
function collectClientPluginNames(configPlugin, type) {
  const names = [];
  if (!configPlugin || !Array.isArray(configPlugin) || !configPlugin.length) {
    return names;
  }
  const initialized = commonLib.initPlugins(configPlugin, type);
  initialized.forEach((plugin) => {
    if (plugin.client && plugin.enable) {
      names.push(plugin.name);
    }
  });
  return names;
}

function generate() {
  let configPlugins = [];
  const configPath = path.join(vendorsRoot, "..", "config.json");
  if (fs.existsSync(configPath)) {
    configPlugins = require(configPath).plugins || [];
  }

  const fromConfig = collectClientPluginNames(configPlugins, "plugin");
  const fromExts = collectClientPluginNames(systemConfigPlugin, "ext");
  const allNames = [...fromConfig, ...fromExts];

  const body = `/**
 * 自动生成：npm run predev / prebuild 会重新生成 enabledPluginNames
 * 插件业务能力由服务端 exts 提供，Next 通过路由与项目设置页接入
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
  console.log(
    "[generate-plugin-registry] 已写入",
    outputFile,
    `(${allNames.length} 个插件)`
  );
}

generate();
