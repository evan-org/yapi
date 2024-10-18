const yapi = require("@/yapi.js");
const websocket = require("./modules/websocket.js");
/** ***************************************************************************/
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
  requestMiddleware: request,
  websocketMiddleware: websocket
};
