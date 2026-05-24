import test from "ava";
import Fastify from "fastify";
import HttpRouter from "../../server/utils/httpRouter.js";
import { createKoaContext } from "../../server/utils/koaContext.js";

test("HttpRouter 注册 GET 路由并返回 JSON", async (t) => {
  const router = new HttpRouter();
  router.get("/api/ping", async (ctx) => {
    ctx.body = { pong: true };
  });

  const fastify = Fastify({ logger: false });
  router.registerTo(fastify, (handler) => {
    return async (request, reply) => {
      const ctx = createKoaContext(request, reply);
      await handler(ctx);
      if (!reply.sent && ctx.body !== undefined) {
        reply.send(ctx.body);
      }
    };
  });

  await fastify.listen({ port: 0, host: "127.0.0.1" });
  const address = fastify.server.address();
  const port = typeof address === "object" ? address.port : 0;

  const res = await fetch(`http://127.0.0.1:${port}/api/ping`);
  const body = await res.json();

  t.is(res.status, 200);
  t.deepEqual(body, { pong: true });

  await fastify.close();
});

test("createAction 支持大写 HTTP 方法名", async (t) => {
  const router = new HttpRouter();
  const { createAction } = require("../../server/utils/commons.js");

  class PingController {
    constructor(ctx) {
      this.ctx = ctx;
    }
    async init() {
      this.$auth = true;
    }
    async ping() {
      this.ctx.body = { ok: 1 };
    }
  }

  createAction(router, "/api", PingController, "ping", "/upper_method", "GET");

  t.is(router.getRoutes().length, 1);
  t.is(router.getRoutes()[0].method, "GET");
});
