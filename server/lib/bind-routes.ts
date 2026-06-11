// @ts-nocheck
/**
 * HTTP / WebSocket 路由收集器，统一挂载到 Hono
 */
import runtime from "../runtime.js";

/** 当 method 为 all 时展开的 HTTP 方法列表 */
const ALL_HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
];

/**
 * @typedef {{ method: string, path: string, handler: (ctx: import('../types/app-context.js').AppContext) => Promise<void> }} RouteEntry
 */

/**
 * 为 @hono/node-ws 封装与控制器兼容的 WebSocket 对象
 * @param {import('@hono/node-ws').WSContext} ws
 */
function createWebSocketAdapter(ws) {
  return {
    send(data) {
      ws.send(typeof data === "string" ? data : JSON.stringify(data));
    },
    on(event, fn) {
      if (event === "close") {
        ws.addEventListener("close", fn);
      }
      if (event === "message") {
        ws.addEventListener("message", (e) => fn(e.data));
      }
    },
  };
}

export default class RouteBinder {
  constructor() {
    /** @type {RouteEntry[]} */
    this._routes = [];
  }

  /**
   * 规范化 HTTP 方法名
   * @param {string} method
   */
  _normalizeMethod(method) {
    const m = (method || "get").toLowerCase();
    if (m === "del") {
      return "DELETE";
    }
    if (m === "all") {
      return "ALL";
    }
    return m.toUpperCase();
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {RouteEntry['handler']} handler
   */
  _register(method, path, handler) {
    this._routes.push({
      method: this._normalizeMethod(method),
      path,
      handler,
    });
  }

  get(path, handler) {
    this._register("get", path, handler);
  }

  post(path, handler) {
    this._register("post", path, handler);
  }

  put(path, handler) {
    this._register("put", path, handler);
  }

  del(path, handler) {
    this._register("del", path, handler);
  }

  delete(path, handler) {
    this._register("del", path, handler);
  }

  patch(path, handler) {
    this._register("patch", path, handler);
  }

  head(path, handler) {
    this._register("head", path, handler);
  }

  options(path, handler) {
    this._register("options", path, handler);
  }

  all(path, handler) {
    this._register("all", path, handler);
  }

  /**
   * 将已注册的 HTTP 路由挂载到 Hono
   * @param {import('hono').Hono} app
   * @param {import('../types/app-context.js').AppContextAdapter} adapter
   */
  mountToHono(app, { createAppContext, finalizeResponse }) {
    for (const route of this._routes) {
      const methods =
        route.method === "ALL" ? ALL_HTTP_METHODS : [route.method];
      for (const m of methods) {
        app.on(m, route.path, async (c) => {
          const ctx = await createAppContext(c);
          await route.handler(ctx);
          return finalizeResponse(c, ctx);
        });
      }
    }
  }

  /**
   * 将已注册的 WebSocket 路由挂载到 Hono
   * @param {import('hono').Hono} app
   * @param {Function} upgradeWebSocket
   * @param {Pick<import('../types/app-context.js').AppContextAdapter, 'createAppContext'>} adapter
   */
  mountWebSocketToHono(app, upgradeWebSocket, { createAppContext }) {
    for (const route of this._routes) {
      if (route.method !== "GET") {
        continue;
      }
      app.get(
        route.path,
        upgradeWebSocket((c) => ({
          async onOpen(_evt, ws) {
            const wsAdapter = createWebSocketAdapter(ws);
            const ctx = await createAppContext(c, { websocket: wsAdapter });
            ctx.ws = wsAdapter;
            ctx.websocket = wsAdapter;
            try {
              await route.handler(ctx);
            } catch (err) {
              runtime.commons.log(err, "error");
              wsAdapter.send(
                JSON.stringify({ errcode: 404, errmsg: "No Fount." })
              );
            }
          },
        }))
      );
    }
  }
}
