// @ts-nocheck
/**
 * Mock 服务 Hono 中间件包装
 */
import mockServer from './mockServer.js';

import { createKoaContext, finalizeKoaContext } from '../adapter/koa-context.js';


/**
 * @param {import('hono').Context} c
 * @param {Function} next
 */
async function mockServerHono(c, next) {
  const ctx = await createKoaContext(c);
  let calledNext = false;
  const nextFn = async () => {
    calledNext = true;
    await next();
  };
  await mockServer(ctx, nextFn);
  if (calledNext) {
    return;
  }
  return finalizeKoaContext(c, ctx);
}

export default mockServerHono;
