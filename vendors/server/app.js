process.env.NODE_PATH = __dirname;
require("module").Module._initPaths();
require("module-alias/register");
//
const Koa = require("koa");
const koaJson = require("koa-json");
const koaLogger = require("koa-logger");
// const koaBodyparser = require("koa-bodyparser");
const historyApiFallback = require("koa2-history-api-fallback");
const koaStatic = require("koa-static");
const koaBody = require("koa-body");
const koaWebsocket = require("koa-websocket");
//
const websocket = require("./service/websocket.js");
//
const yapi = require("./yapi.js");
const commons = require("./utils/commons.js");
const dbModule = require("./service/db.js");
//
yapi.commons = commons;
yapi.connect = dbModule.connect();
//
const ExtsPlugin = require("./plugins/ExtsPlugin.js");
ExtsPlugin();
//
const NoticePlugin = require("./plugins/NoticePlugin.js");
NoticePlugin();
//
const storageCreator = require("./utils/storage.js");
global.storageCreator = storageCreator;
//
let indexFile = process.argv[2] === "dev" ? "dev.html" : "index.html";
//
const router = require("./routes/router.js");
//
const app = koaWebsocket(new Koa());
yapi.app = app;
app.proxy = true;
// app.use(koaBodyparser())
app.use(koaBody({ strict: false, multipart: true, jsonLimit: "2mb", formLimit: "1mb", textLimit: "1mb" }));
app.use(koaJson());
app.use(koaLogger());
app.use(router.routes());
app.use(historyApiFallback())
app.use(router.allowedMethods());
//
websocket(app);
//
const mockServer = require("@server/middleware/mockServer.js");
app.use(mockServer);
// 中间件
app.use(async(ctx, next) => {
  let start = new Date()
  await next()
  let ms = new Date() - start
  console.log("%s %s - %s", ctx.method, ctx.url, ms)
});
//
app.use(async(ctx, next) => {
  if (/^\/(?!api)[\w/-]*$/i.test(ctx.path)) {
    ctx.path = "/";
    await next();
  } else {
    await next();
  }
});
//
app.use(async(ctx, next) => {
  if (ctx.path.indexOf("/prd") === 0) {
    ctx.set("Cache-Control", "max-age=8640000000");
    if (yapi.commons.fileExist(yapi.path.join(yapi.WEBROOT, "static", ctx.path + ".gz"))) {
      ctx.set("Content-Encoding", "gzip");
      ctx.path = ctx.path + ".gz";
    }
  }
  await next();
});
//
app.use(koaStatic(yapi.path.join(yapi.WEBROOT, "static"), { index: indexFile, gzip: true }));
// run
const server = app.listen(yapi.WEBROOT_CONFIG.port);
//
server.setTimeout(yapi.WEBROOT_CONFIG.timeout);
// log
const port = yapi.WEBROOT_CONFIG.port?.toString() === "80" ? "" : ":" + yapi.WEBROOT_CONFIG.port;
//
commons.log(`服务已启动，请打开下面链接访问: \nhttp://127.0.0.1${port}/`);
