const yapi = require("@server/yapi.js");
//
const InterfaceController = require("@server/controllers/InterfaceController.js");
//
const Router = require("@koa/router");
const router = new Router();
//
const { createAction } = require("@server/utils/commons.js");
const pluginsRouterPath = [];
//
function addPluginRouter(config) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error("Plugin Route config Error");
  }
  let method = config.method || "GET";
  let routerPath = "/ws_plugin/" + config.path;
  if (pluginsRouterPath.indexOf(routerPath) > -1) {
    throw new Error("Plugin Route path conflict, please try rename the path")
  }
  pluginsRouterPath.push(routerPath);
  //
  createAction(router, "/api", config.controller, config.action, routerPath, method, true);
}
//
function websocket(app) {
  console.log("init ws router", app);
  createAction(router, "/api", InterfaceController, "solveConflict", "/interface/solve_conflict", "get", false);
  //
  // yapi.emitHookSync("add_ws_router", addPluginRouter);
  app.ws.use(router.routes())
  app.ws.use(router.allowedMethods());
  app.ws.use((ctx, next) => ctx.websocket.send(JSON.stringify({
    errcode: 404,
    errmsg: "Not Found.",
    data: null
  })));
}

module.exports = websocket
