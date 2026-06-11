// @ts-nocheck
/**
 * Hono 应用基础冒烟测试
 */
import test from "ava";
import RouteBinder from "../../lib/bind-routes.js";
import appContext from "../../lib/context.js";

test("RouteBinder 提供 Hono 挂载方法", (t) => {
  const binder = new RouteBinder();
  t.is(typeof binder.mountToHono, "function");
  t.is(typeof binder.mountWebSocketToHono, "function");
  t.is(typeof binder.registerToHono, "undefined");
});

test("appContext 适配器可加载", (t) => {
  t.is(typeof appContext.createAppContext, "function");
  t.is(typeof appContext.finalizeResponse, "function");
});
