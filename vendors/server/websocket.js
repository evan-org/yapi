const HttpRouter = require("./utils/httpRouter.js");
const interfaceController = require("./controllers/interface.js");
const yapi = require("./yapi.js");
const { createAction } = require("./utils/commons.js");
const { createKoaContext } = require("./utils/koaContext.js");

const router = new HttpRouter();
let pluginsRouterPath = [];

function addPluginRouter(config) {
  if (!config.path || !config.controller || !config.action) {
    throw new Error("Plugin Route config Error");
  }
  let method = config.method || "GET";
  let routerPath = "/ws_plugin/" + config.path;
  if (pluginsRouterPath.indexOf(routerPath) > -1) {
    throw new Error("Plugin Route path conflict, please try rename the path");
  }
  pluginsRouterPath.push(routerPath);
  createAction(router, "/api", config.controller, config.action, routerPath, method, true);
}

createAction(router, "/api", interfaceController, "solveConflict", "/interface/solve_conflict", "get", true);
yapi.emitHookSync("add_ws_router", addPluginRouter);

function registerWebSocket(fastify) {
  const methodMap = {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "delete",
    PATCH: "patch",
    HEAD: "head",
    OPTIONS: "options"
  };

  for (const route of router.getRoutes()) {
    const fastifyMethod = methodMap[route.method] || "get";
    if (typeof fastify[fastifyMethod] !== "function") {
      continue;
    }

    fastify[fastifyMethod](route.path, { websocket: true }, (socket, request) => {
      const wsAdapter = {
        send(data) {
          socket.send(data);
        },
        on(event, fn) {
          socket.on(event, fn);
        }
      };
      const fakeReply = {
        sent: false,
        header() {},
        code() {
          return this;
        },
        send(data) {
          this.sent = true;
          wsAdapter.send(typeof data === "string" ? data : JSON.stringify(data));
        }
      };
      const ctx = createKoaContext(request, fakeReply, { ws: wsAdapter });
      route.handler(ctx).catch((err) => {
        yapi.commons.log(err, "error");
        wsAdapter.send(JSON.stringify({ errcode: 404, errmsg: "No Fount." }));
      });
    });
  }
}

module.exports = registerWebSocket;
