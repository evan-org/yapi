// @ts-nocheck
import runtime from "../runtime.js";

/**
 * 收集 HTTP 路由并在 Hono 应用上挂载（替代旧 koa-router 收集器）
 */
export default class RouteBinder {
  constructor() {
    this._routes = [];
  }

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
   * 将已注册路由挂载到 Hono
   */
  mountToHono(app, { createAppContext, finalizeResponse }) {
    for (const route of this._routes) {
      const methods =
        route.method === "ALL"
          ? ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
          : [route.method];
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
   * 将 WebSocket 路由挂载到 Hono（@hono/node-ws）
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
            const wsAdapter = {
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
            const ctx = await createAppContext(c, { websocket: wsAdapter });
            ctx.ws = wsAdapter;
            ctx.websocket = wsAdapter;
            try {
              await route.handler(ctx);
            } catch (err) {
              runtime.commons.log(err, "error");
              wsAdapter.send(JSON.stringify({ errcode: 404, errmsg: "No Fount." }));
            }
          },
        }))
      );
    }
  }
}
