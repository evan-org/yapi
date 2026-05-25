/**
 * 兼容 koa-router API 的路由收集器，最终通过 registerToHono 挂载到 Hono。
 */
class HttpRouter {
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
      handler
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


  getRoutes() {
    return this._routes;
  }

  routes() {
    return async () => {};
  }

  allowedMethods() {
    return async () => {};
  }
}

module.exports = HttpRouter;

/**
 * 将收集的路由注册到 Hono 应用
 * @param {import('hono').Hono} app
 * @param {{ createKoaContext: Function, finalizeKoaContext: Function }} adapters
 */
HttpRouter.prototype.registerToHono = function registerToHono(app, adapters) {
  const { createKoaContext, finalizeKoaContext } = adapters;
  for (const route of this._routes) {
    const method = route.method === "ALL" ? "ALL" : route.method;
    const methods = method === "ALL"
      ? ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
      : [method];
    for (const m of methods) {
      app.on(m, route.path, async (c) => {
        const ctx = await createKoaContext(c);
        await route.handler(ctx);
        return finalizeKoaContext(c, ctx);
      });
    }
  }
};

/**
 * 将 WebSocket 路由注册到 Hono（@hono/node-ws）
 * @param {import('hono').Hono} app
 * @param {Function} upgradeWebSocket
 * @param {{ createKoaContext: Function }} adapters
 */
HttpRouter.prototype.registerWsToHono = function registerWsToHono(app, upgradeWebSocket, adapters) {
  const { createKoaContext } = adapters;
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
          const ctx = await createKoaContext(c, { websocket: wsAdapter });
          ctx.ws = wsAdapter;
          ctx.websocket = wsAdapter;
          try {
            await route.handler(ctx);
          } catch (err) {
            require("../yapi.js").commons.log(err, "error");
            wsAdapter.send(JSON.stringify({ errcode: 404, errmsg: "No Fount." }));
          }
        },
      }))
    );
  }
};
