// @ts-nocheck
/**
 * REST API 入口：创建 RouteBinder 并挂载到 Hono
 * 路由表见 routes/config/，注册逻辑见 routes/register-api.ts
 */
import RouteBinder from "../lib/bind-routes.js";
import appContext from "../lib/context.js";
import { setupApiBinder } from "./register-api.js";

const binder = new RouteBinder();
setupApiBinder(binder);

/**
 * 将 /api/* 路由挂载到 Hono 应用
 * @param {import('hono').Hono} app
 */
export function mountApiRoutes(app) {
  binder.mountToHono(app, appContext);
}
