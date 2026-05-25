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
 * 自动生成：npm run predev / prebuild 会重新生成，请勿手改
 * 插件 UI 迁移至 Next 后在此注册客户端模块
 */
export const enabledPluginNames: string[] = ${JSON.stringify(allNames, null, 2)};

export type PluginRegistry = Record<
  string,
  { module: unknown; options: Record<string, unknown> | null }
>;

/** 占位注册表，待各 exts 插件提供 Next 客户端入口后填充 */
export const pluginRegistry: PluginRegistry = {};
`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, body, "utf8");
  console.log(
    "[generate-plugin-registry] 已写入",
    outputFile,
    `(${allNames.length} 个待迁移插件)`
  );
}

generate();
