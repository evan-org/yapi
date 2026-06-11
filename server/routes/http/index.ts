// @ts-nocheck
/**
 * HTTP 路由聚合：各业务模块路由
 */
import RouteBinder from "../../lib/bind-routes.js";
import appContext from "../../lib/context.js";
import { registerGroupRoutes } from "../modules/group.routes.js";
import { registerUserRoutes } from "../modules/user.routes.js";
import { registerProjectRoutes } from "../modules/project.routes.js";
import { registerInterfaceRoutes } from "../modules/interface.routes.js";
import { registerLogRoutes } from "../modules/log.routes.js";
import { registerFollowRoutes } from "../modules/follow.routes.js";
import { registerColRoutes } from "../modules/col.routes.js";
import { registerOpenRoutes } from "../modules/open.routes.js";
import { registerWikiRoutes } from "../modules/wiki.routes.js";
import { registerStatisticsRoutes } from "../modules/statistics.routes.js";
import { registerAdvancedMockRoutes } from "../modules/advanced-mock.routes.js";
import { registerExportRoutes } from "../modules/export.routes.js";
import { registerSwaggerSyncRoutes } from "../modules/swagger-sync.routes.js";

const binder = new RouteBinder();

/** 业务模块路由注册器（顺序无关） */
const moduleRegistrars = [
  registerUserRoutes,
  registerGroupRoutes,
  registerProjectRoutes,
  registerInterfaceRoutes,
  registerLogRoutes,
  registerFollowRoutes,
  registerColRoutes,
  registerOpenRoutes,
  registerWikiRoutes,
  registerStatisticsRoutes,
  registerAdvancedMockRoutes,
  registerExportRoutes,
  registerSwaggerSyncRoutes,
];

/**
 * 初始化 HTTP 路由
 */
function setupHttpRoutes() {
  for (const register of moduleRegistrars) {
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
