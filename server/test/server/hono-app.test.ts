// @ts-nocheck
/**
 * Hono 应用基础冒烟测试
 */
import test from "ava";
import HttpRouter from "../../utils/httpRouter.js";
import koaCtx from "../../adapter/koa-context.js";

test("httpRouter 提供 Hono 注册方法", (t) => {
  const router = new HttpRouter();
  t.is(typeof router.registerToHono, "function");
  t.is(typeof router.registerWsToHono, "function");
  t.is(typeof router.registerTo, "undefined");
});

test("koa-context 适配器可加载", (t) => {
  t.is(typeof koaCtx.createKoaContext, "function");
  t.is(typeof koaCtx.finalizeKoaContext, "function");
});
