const yapi = require("@server/yapi.js");
//
const mockServer = require("./modules/mockServer.js");
const websocket = require("./modules/websocket.js");

/** ***************************************************************************/

/**
 * @param {{path:string}} ctx
 * @param next
 * */
const route = async(ctx, next) => {
  if (/^\/(?!api)[\w/-]*$/i.test(ctx.path)) {
    ctx.path = "/";
    await next();
  } else {
    await next();
  }
}
/**
 *
 * */
const request = async(ctx, next) => {
  if (ctx.path.indexOf("/prd") === 0) {
    ctx.set("Cache-Control", "max-age=8640000000");
    if (yapi.commons.fileExist(yapi.path.join(yapi.WEBROOT, "static", ctx.path + ".gz"))) {
      ctx.set("Content-Encoding", "gzip");
      ctx.path = ctx.path + ".gz";
    }
  }
  await next();
}
//
module.exports = {
  routeMiddleware: route,
  requestMiddleware: request,
  mockServerMiddleware: mockServer,
  websocketMiddleware: websocket
};
