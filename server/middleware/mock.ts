// @ts-nocheck
/**
 * Mock 接口 Hono 中间件（/mock/*）
 */
import appContext from "../lib/context.js";
import mockHandler from "./mock-handler.js";

/**
 * @param {import('hono').Context} c
 * @param {Function} next
 */
export default async function mockMiddleware(c, next) {
  const ctx = await appContext.createAppContext(c);
  let calledNext = false;
  const nextFn = async () => {
    calledNext = true;
    await next();
  };
  await mockHandler(ctx, nextFn);
  if (calledNext) {
    return;
  }
  return appContext.finalizeResponse(c, ctx);
}
