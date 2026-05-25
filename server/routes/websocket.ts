// @ts-nocheck
/**
 * WebSocket 入口：挂载到 Hono（@hono/node-ws）
 */
import RouteBinder from "../lib/bind-routes.js";
import appContext from "../lib/context.js";
import { setupWebSocketBinder } from "./register-websocket.js";

const binder = new RouteBinder();
setupWebSocketBinder(binder);

/**
 * 将 WebSocket 路由挂载到 Hono
 * @param {import('hono').Hono} app
 * @param {Function} upgradeWebSocket - createNodeWebSocket 返回的升级函数
 */
export function mountWebSocketRoutes(app, upgradeWebSocket) {
  binder.mountWebSocketToHono(app, upgradeWebSocket, appContext);
}
