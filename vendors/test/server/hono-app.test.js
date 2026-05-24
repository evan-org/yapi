/**
 * Hono 应用基础冒烟测试
 */
const test = require("ava");

test("httpRouter 提供 Hono 注册方法", (t) => {
  const HttpRouter = require("../../server/utils/httpRouter.js");
  const router = new HttpRouter();
  t.is(typeof router.registerToHono, "function");
  t.is(typeof router.registerWsToHono, "function");
  t.is(typeof router.registerTo, "undefined");
});

test("koa-context 适配器可加载", (t) => {
  const koaCtx = require("../../server/adapter/koa-context.js");
  t.is(typeof koaCtx.createKoaContext, "function");
  t.is(typeof koaCtx.finalizeKoaContext, "function");
});
