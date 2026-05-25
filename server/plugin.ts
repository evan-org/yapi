// @ts-nocheck
import path from "node:path";
import yapi from "./yapi.js";
import { initPlugins } from "./common/plugin.js";
import configModule from "./common/config.js";
import { createMetaRequire } from "./utils/esm-path.js";

const plugin_path = yapi.path.join(yapi.WEBROOT, "node_modules");
const plugin_system_path = yapi.path.join(yapi.WEBROOT, "exts");
const requirePlugin = createMetaRequire(import.meta);
let extConfig = configModule.exts;

/**
 * 钩子配置
 */
const hooks = {
  third_login: { type: "single", listener: null },
  interface_add: { type: "multi", listener: [] },
  interface_del: { type: "multi", listener: [] },
  interface_update: { type: "multi", listener: [] },
  interface_list: { type: "multi", listener: [] },
  interface_get: { type: "multi", listener: [] },
  project_add: { type: "multi", listener: [] },
  project_up: { type: "multi", listener: [] },
  project_get: { type: "multi", listener: [] },
  project_del: { type: "multi", listener: [] },
  export_markdown: { type: "multi", listener: [] },
  mock_after: { type: "multi", listener: [] },
  add_router: { type: "multi", listener: [] },
  add_ws_router: { type: "multi", listener: [] },
  import_data: { type: "multi", listener: [] },
  addNotice: { type: "multi", listener: [] },
};

function bindHook(name, listener) {
  if (!name) {
    throw new Error("缺少hookname");
  }
  if (name in hooks === false) {
    throw new Error("不存在的hookname");
  }
  if (hooks[name].type === "multi") {
    hooks[name].listener.push(listener);
  } else {
    if (typeof hooks[name].listener === "function") {
      throw new Error("重复绑定singleHook(" + name + "), 请检查");
    }
    hooks[name].listener = listener;
  }
}

function emitHook(name) {
  if (hooks[name] && typeof hooks[name] === "object") {
    const args = Array.prototype.slice.call(arguments, 1);
    if (hooks[name].type === "single" && typeof hooks[name].listener === "function") {
      return Promise.resolve(hooks[name].listener.apply(yapi, args));
    }
    const promiseAll = [];
    if (Array.isArray(hooks[name].listener)) {
      const listenerList = hooks[name].listener;
      for (let i = 0, l = listenerList.length; i < l; i++) {
        promiseAll.push(Promise.resolve(listenerList[i].apply(yapi, args)));
      }
    }
    return Promise.all(promiseAll);
  }
}

yapi.bindHook = bindHook;
yapi.emitHook = emitHook;
yapi.emitHookSync = emitHook;

/**
 * 解析插件 server 入口（兼容 .ts 源码与 dist 编译后的 .js）
 */
function resolvePluginServerEntry(baseDir, pluginName) {
  const stem = yapi.path.join(baseDir, "yapi-plugin-" + pluginName, "server");
  for (const ext of [".ts", ".js", ""]) {
    const entry = stem + ext;
    if (yapi.commons.fileExist(entry)) {
      return entry;
    }
  }
  throw new Error(
    `config.json 配置了插件 ${pluginName}，但未找到 server 入口（${stem}.ts/.js）`
  );
}

function loadPluginModule(baseDir, plugin) {
  const serverEntry = resolvePluginServerEntry(baseDir, plugin.name);
  const pluginModule = requirePlugin(serverEntry);
  const fn = pluginModule.default || pluginModule;
  fn.call(yapi, plugin.options);
}

const pluginsConfig = initPlugins(yapi.WEBCONFIG.plugins, "plugin");
pluginsConfig.forEach((plugin) => {
  if (!plugin || plugin.enable === false || plugin.server === false) {
    return null;
  }
  loadPluginModule(plugin_path, plugin);
});

extConfig = initPlugins(extConfig, "ext");

extConfig.forEach((plugin) => {
  if (!plugin || plugin.enable === false || plugin.server === false) {
    return null;
  }
  loadPluginModule(plugin_system_path, plugin);
});

delete yapi.bindHook;
