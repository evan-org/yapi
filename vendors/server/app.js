process.env.NODE_PATH = __dirname;
require("module").Module._initPaths();
require("module-alias/register");
//
const indexFile = process.argv[2] === "dev" ? "dev.html" : "index.html";
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
const storageCreator = require("./utils/storage.js");
global.storageCreator = storageCreator;
// 全局挂载
const yapi = require("./yapi.js");
//
const commons = require("./utils/commons.js");
const mongodb = require("@server/helper/mongodb.js");
//
yapi.commons = commons;
yapi.connect = mongodb.connect();
//
const ExtsPlugin = require("./plugins/ExtsPlugin.js");
ExtsPlugin();
//
const NoticePlugin = require("./plugins/NoticePlugin.js");
NoticePlugin();
//
const app = koaWebsocket(new Koa());
app.context.commons = commons;
app.context.mongodb = mongodb.connect();
yapi.app = app;
const { websocketMiddleware, mockServerMiddleware, requestMiddleware, routeMiddleware } = require("@server/middleware/index.js");
app.use(mockServerMiddleware);
app.use(routeMiddleware);
app.use(requestMiddleware);
//
const router = require("./routes/router.js");
app.proxy = true;
// app.use(koaBodyparser())
app.use(koaBody({ strict: false, multipart: true, jsonLimit: "2mb", formLimit: "1mb", textLimit: "1mb" }));
app.use(koaJson());
app.use(koaLogger());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(historyApiFallback({
  index: "../dist/index.html", // 入口 HTML 文件路径
  whiteList: ["/api"], // 排除不需要拦截的请求
}));
//
websocketMiddleware(app);
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
