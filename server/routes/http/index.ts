// @ts-nocheck
/**
 * HTTP 路由聚合：内置业务模块 + 插件钩子
 */
import yapi from "../runtime.js";
import RouteBinder from "../lib/bind-routes.js";
import appContext from "../lib/context.js";
import { registerPluginRoute } from "./register-routes.js";
import { registerGroupRoutes } from "./modules/group.routes.js";
import { registerUserRoutes } from "./modules/user.routes.js";
import { registerProjectRoutes } from "./modules/project.routes.js";
import { registerInterfaceRoutes } from "./modules/interface.routes.js";
import { registerLogRoutes } from "./modules/log.routes.js";
import { registerFollowRoutes } from "./modules/follow.routes.js";
import { registerColRoutes } from "./modules/col.routes.js";
import { registerOpenRoutes } from "./modules/open.routes.js";

const binder = new RouteBinder();
const pluginRoutePaths = [];

/** 内置业务模块路由注册器（顺序无关） */
const builtinRegistrars = [
  registerUserRoutes,
  registerGroupRoutes,
  registerProjectRoutes,
  registerInterfaceRoutes,
  registerLogRoutes,
  registerFollowRoutes,
  registerColRoutes,
  registerOpenRoutes,
];

/**
 * 初始化 HTTP 路由（插件路由 + 内置模块）
 */
function setupHttpRoutes() {
  yapi.emitHookSync("add_router", (config) =>
    registerPluginRoute(binder, config, pluginRoutePaths)
  );
  for (const register of builtinRegistrars) {
    register(binder);
  }
}

setupHttpRoutes();

/**
 * 将 /api/* 路由挂载到 Hono
 * @param {import('hono').Hono} app
 */
export function mountApiRoutes(app) {
  binder.mountToHono(app, appContext);
}
