// global-middleware.js
module.exports = function globalMiddleware(yapi) {
  return async (ctx, next) => {
    // 设置全局变量
    ctx.yapi = yapi;

    // 调用下一个中间件
    await next();
  };
};
