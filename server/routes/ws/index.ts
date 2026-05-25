// @ts-nocheck
/**
 * WebSocket 路由聚合
 */
import RouteBinder from "../../lib/bind-routes.js";
import appContext from "../../lib/context.js";
import interfaceController from "../../controllers/interface.js";
import wikiController from "../../controllers/wiki.js";
import { createAction } from "../../lib/action-runner.js";
import { API_BASE } from "../register-routes.js";

const binder = new RouteBinder();

createAction(
  binder,
  API_BASE,
  interfaceController,
  "solveConflict",
  "/interface/solve_conflict",
  "get",
  true
);
createAction(
  binder,
  API_BASE,
  wikiController,
  "wikiConflict",
  "/ws_plugin/wiki_desc/solve_conflict",
  "get",
  true
);

/**
 * 挂载 WebSocket 路由
 * @param {import('hono').Hono} app
 * @param {Function} upgradeWebSocket
 */
export function mountWebSocketRoutes(app, upgradeWebSocket) {
  binder.mountWebSocketToHono(app, upgradeWebSocket, appContext);
}
