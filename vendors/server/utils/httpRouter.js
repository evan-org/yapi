/**
 * 兼容 koa-router API 的路由收集器，最终注册到 Fastify。
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

  registerTo(fastify, wrapHandler) {
    const allMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
    for (const route of this._routes) {
      const methods = route.method === "ALL" ? allMethods : [route.method];
      for (const method of methods) {
        fastify.route({
          method,
          url: route.path,
          handler: wrapHandler(route.handler)
        });
      }
    }
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
