// @ts-nocheck
import path from "node:path";
import _ from "underscore";
import { createMetaRequire } from "../utils/esm-path.js";
import { dirnameFromMeta } from "../utils/esm-path.js";

const __dirname = dirnameFromMeta(import.meta);
const requireDynamic = createMetaRequire(import.meta);

function getPluginConfig(name, type) {
  let pluginConfig;
  if (type === "ext") {
    pluginConfig = requireDynamic(
      path.join(__dirname, "../exts/yapi-plugin-" + name)
    );
  } else {
    pluginConfig = requireDynamic("yapi-plugin-" + name);
  }

  if (!pluginConfig || typeof pluginConfig !== "object") {
    throw new Error(`Plugin ${name} Config 配置错误，请检查 yapi-plugin-${name}/index.js`);
  }

  return {
    server: pluginConfig.server,
    client: pluginConfig.client,
  };
}

/**
 * type: plugin 外部插件 | ext 内置插件
 */
export function initPlugins(plugins, type) {
  if (!plugins) {
    return [];
  }
  if (typeof plugins !== "object" || !Array.isArray(plugins)) {
    throw new Error("插件配置有误，请检查", plugins);
  }

  plugins = plugins.map((item) => {
    let pluginConfig;
    if (item && typeof item === "string") {
      pluginConfig = getPluginConfig(item, type);
      return Object.assign({}, pluginConfig, { name: item, enable: true });
    } else if (item && typeof item === "object") {
      pluginConfig = getPluginConfig(item.name, type);
      return Object.assign({}, pluginConfig, {
        name: item.name,
        options: item.options,
        enable: item.enable !== false,
      });
    }
  });
  plugins = plugins.filter((item) => item.enable === true && (item.server || item.client));

  return _.uniq(plugins, (item) => item.name);
}
