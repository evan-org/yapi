/**
 * YApi 服务入口（Hono + Node）
 */
process.env.NODE_PATH = __dirname;
require("module").Module._initPaths();

const path = require("path");
const { Hono } = require("hono");
const { serve } = require("@hono/node-server");
const { serveStatic } = require("@hono/node-server/serve-static");
const { createNodeWebSocket } = require("@hono/node-ws");

const yapi = require("./yapi.js");
const commons = require("./utils/commons");
const dbModule = require("./utils/db.js");
const mockServerHono = require("./middleware/mockServerHono.js");
const storageCreator = require("./utils/storage");
const koaCtx = require("./adapter/koa-context");
const { assertRuntimeConfig } = require("./utils/configCheck");

yapi.commons = commons;
yapi.connect = dbModule.connect();
require("./plugin.js");
require("./utils/notice");

const apiRouter = require("./router.js");
const registerWebSocket = require("./websocket.js");

global.storageCreator = storageCreator;

const indexFile = process.argv[2] === "dev" ? "dev.html" : "index.html";
const staticRoot = yapi.path.join(yapi.WEBROOT, "static");

/**
 * 创建并启动 Hono 应用
 */
async function startServer() {
  if (process.argv[2] === "dev") {
    require(path.join(__dirname, "../scripts/dev-bootstrap.js"));
  }
  assertRuntimeConfig();

  const app = new Hono();
  const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
  yapi.app = app;

  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      framework: "hono",
      version: require("../package.json").version,
    })
  );

  app.use("*", mockServerHono);

  apiRouter.registerToHono(app, koaCtx);
  registerWebSocket(app, upgradeWebSocket);

  /** SPA 路由回退到 index */
  app.use("*", async (c, next) => {
    const pathname = new URL(c.req.url).pathname;
    if (/^\/(?!api)[a-zA-Z0-9/\-_]*$/.test(pathname)) {
      return serveStatic({
        root: staticRoot,
        path: indexFile,
      })(c, next);
    }
    await next();
  });

  /** /prd 静态资源长缓存与预压缩 */
  app.use("/prd/*", async (c, next) => {
    const pathname = new URL(c.req.url).pathname;
    c.header("Cache-Control", "max-age=8640000000");
    const gzPath = path.join(staticRoot, pathname + ".gz");
    if (commons.fileExist(gzPath)) {
      c.header("Content-Encoding", "gzip");
      return serveStatic({
        root: staticRoot,
        rewriteRequestPath: () => pathname + ".gz",
      })(c, next);
    }
    await next();
  });

  app.use(
    "*",
    serveStatic({
      root: staticRoot,
      rewriteRequestPath: (p) => (p === "/" ? `/${indexFile}` : p),
    })
  );

  const port = Number(yapi.WEBCONFIG.port) || 3001;
  const server = serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  });

  if (server && typeof server.setTimeout === "function") {
    server.setTimeout(yapi.WEBCONFIG.timeout);
  }
  injectWebSocket(server);

  const shutdown = () => {
    commons.log("正在关闭服务...");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  if (process.argv[2] === "dev") {
    const devPort = process.env.YAPI_DEV_CLIENT_PORT || "4000";
    commons.log(
      `开发服务已启动 (Hono):\n` +
        `  API:  http://127.0.0.1${port === 80 ? "" : ":" + port}/\n` +
        `  前端: http://127.0.0.1:${devPort}/`
    );
  } else {
    commons.log(
      `服务已启动 (Hono)，请打开下面链接访问: \nhttp://127.0.0.1${
        port === 80 ? "" : ":" + port
      }/`
    );
  }

  return app;
}

module.exports = { startServer };

if (require.main === module) {
  startServer().catch((err) => {
    commons.log(err, "error");
    process.exit(1);
  });
}
