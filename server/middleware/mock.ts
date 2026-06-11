// @ts-nocheck
/**
 * Mock 接口 Hono 中间件
 *
 * 匹配 /mock/* 时由 mock-handler 生成模拟数据并直接响应；
 * 未匹配时调用 next() 继续后续路由。
 */
import appContext from "../lib/context.js";
import mockHandler from "./mock-handler.js";

/**
 * @param {import('hono').Context} c
 * @param {Function} next
 */
export default async function mockMiddleware(c, next) {
  const ctx = await appContext.createAppContext(c);
  let passedToNext = false;
  const nextFn = async () => {
    passedToNext = true;
    await next();
  };
  await mockHandler(ctx, nextFn);
  if (passedToNext) {
    return;
  }
  return appContext.finalizeResponse(c, ctx);
}
