// @ts-nocheck
/**
 * 将路由配置注册到 RouteBinder（内置 API + 插件钩子）
 */
import yapi from "../runtime.js";
import { createAction } from "../utils/commons.js";
import { API_ACTIONS } from "./config/api-actions.js";
import { MODULE_PREFIX } from "./config/module-prefix.js";

const API_BASE = "/api";

/** 已注册的插件路由 path，用于冲突检测 */
const pluginRoutePaths = [];

/**
 * 注册单个插件 HTTP 路由（由 yapi.emitHookSync('add_router') 调用）
 * @param {{ path: string, controller: object, action: string, method?: string, prefix?: string }} config
 * @param {import('../lib/bind-routes.js').default} binder
 */
function registerPluginRoute(binder, config) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error("Plugin Route config Error");
  }
  const method = config.method || "GET";
  const routerPath = (config.prefix || "") + "/plugin/" + config.path;
  if (pluginRoutePaths.includes(routerPath)) {
    throw new Error("Plugin Route path conflict, please try rename the path");
  }
  pluginRoutePaths.push(routerPath);
  createAction(
    binder,
    API_BASE,
    config.controller,
    config.action,
    routerPath,
    method,
    false
  );
}

/**
 * 注册内置 /api 路由表
 * @param {import('../lib/bind-routes.js').default} binder
 */
function registerBuiltinRoutes(binder) {
  for (const moduleName of Object.keys(API_ACTIONS)) {
    const moduleMeta = MODULE_PREFIX[moduleName];
    if (!moduleMeta) {
      throw new Error(`API_ACTIONS 模块 "${moduleName}" 未在 MODULE_PREFIX 中定义`);
    }
    const actions = API_ACTIONS[moduleName];
    for (const item of actions) {
      const fullPath = moduleMeta.prefix + item.path;
      createAction(
        binder,
        API_BASE,
        moduleMeta.controller,
        item.action,
        fullPath,
        item.method
      );
    }
  }
}

/**
 * 初始化 API 路由绑定器（内置 + 插件）
 * @param {import('../lib/bind-routes.js').default} binder
 */
export function setupApiBinder(binder) {
  /** 先执行插件在 add_router 钩子里注册的路由，再注册内置表 */
  yapi.emitHookSync("add_router", (config) => registerPluginRoute(binder, config));
  registerBuiltinRoutes(binder);
}
