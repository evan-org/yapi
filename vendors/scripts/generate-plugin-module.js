/**
 * 根据 config.json 与 exts 配置生成 client/plugin-module.js（供 Vite / 开发预构建使用）
 */
const fs = require("fs");
const path = require("path");

const vendorsRoot = path.join(__dirname, "..");
const outputFile = path.join(vendorsRoot, "client", "plugin-module.js");

const commonLib = require(path.join(vendorsRoot, "common/plugin.js"));
const { exts: systemConfigPlugin } = require(path.join(vendorsRoot, "common/config"));

/**
 * 生成单条插件的 import 与配置项
 * @param {object} plugin
 * @param {"node_modules"|"exts"} source
 * @param {number} index
 */
function buildPluginEntry(plugin, source, index) {
  const varName = `pluginMod${index}`;
  const importPath =
    source === "node_modules"
      ? `yapi-plugin-${plugin.name}/client.js`
      : `../exts/yapi-plugin-${plugin.name}/client.js`;
  const options =
    plugin.options != null ? JSON.stringify(plugin.options) : "null";
  return {
    importLine: `import * as ${varName} from "${importPath}";`,
    entry: `"${plugin.name}": { module: pick(${varName}), options: ${options} }`,
  };
}

/**
 * 收集已启用且含 client 的插件
 * @param {Array} configPlugin
 * @param {"plugin"|"ext"} type
 * @param {"node_modules"|"exts"} source
 */
function collectPlugins(configPlugin, type, source) {
  const lines = [];
  const imports = [];
  if (!configPlugin || !Array.isArray(configPlugin) || !configPlugin.length) {
    return { imports, lines };
  }
  const initialized = commonLib.initPlugins(configPlugin, type);
  let index = 0;
  initialized.forEach((plugin) => {
    if (plugin.client && plugin.enable) {
      const { importLine, entry } = buildPluginEntry(plugin, source, index);
      imports.push(importLine);
      lines.push(entry);
      index += 1;
    }
  });
  return { imports, lines };
}

function generate() {
  let configPlugins = [];
  const configPath = path.join(vendorsRoot, "..", "config.json");
  if (fs.existsSync(configPath)) {
    configPlugins = require(configPath).plugins || [];
  }

  const fromConfig = collectPlugins(configPlugins, "plugin", "node_modules");
  const fromExts = collectPlugins(systemConfigPlugin, "ext", "exts");

  const imports = [...fromConfig.imports, ...fromExts.imports];
  const entries = [...fromConfig.lines, ...fromExts.lines];

  const body = `/**
 * 自动生成：npm run predev / prebuild 会重新生成，请勿手改
 */
${imports.join("\n")}

/** 兼容 CJS / ESM 插件入口 */
function pick(mod) {
  return mod && mod.default ? mod.default : mod;
}

export default {
  ${entries.join(",\n  ")}
};
`;

  fs.writeFileSync(outputFile, body, "utf8");
  console.log("[generate-plugin-module] 已写入", outputFile, `(${entries.length} 个插件)`);
}

generate();
