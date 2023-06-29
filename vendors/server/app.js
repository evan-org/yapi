require("module-alias/register");
const dotEnv = require("dotenv");
dotEnv.config();
/* ******************************************************************************** */
const Koa = require("koa");
const koaJson = require("koa-json");
const koaLogger = require("koa-logger");
const koaStatic = require("koa-static");
const koaBody = require("koa-body");
const koaWebsocket = require("koa-websocket");
/* ******************************************************************************** */
// 全局挂载
const yapi = require("@server/yapi.js");
const commons = require("@server/utils/commons.js");
const useMongodb = require("@server/helper/mongodb.js");
const storageCreator = require("@server/utils/storage.js");
yapi.commons = commons;
yapi.connect = useMongodb.connect();
yapi.storageCreator = storageCreator;
/* ******************************************************************************** */
// Exts插件装载
const ExtsPlugin = require("./plugins/ExtsPlugin.js");
ExtsPlugin();
// Notice插件装载
const NoticePlugin = require("./plugins/NoticePlugin.js");
NoticePlugin();
/* ******************************************************************************** */
const app = koaWebsocket(new Koa());
const { websocketMiddleware, mockServerMiddleware, routeMiddleware } = require("@server/middleware/index.js");
app.use(mockServerMiddleware);
app.use(routeMiddleware);
//
const router = require("./routes/router.js");
console.log(app);
app.proxy = true;
// app.use(koaBodyparser())
app.use(koaBody({ strict: false, multipart: true, jsonLimit: "2mb", formLimit: "1mb", textLimit: "1mb" }));
app.use(koaJson());
app.use(koaLogger());
app.use(router.routes());
app.use(router.allowedMethods());
//
websocketMiddleware(app);
//
const indexFile = process.argv[2] === "dev" ? "dev.html" : "index.html";
app.use(koaStatic(yapi.path.join(yapi.WEBROOT, "static"), { index: indexFile, gzip: true }));
// run
const server = app.listen(yapi.WEBROOT_CONFIG.port);
//
server.setTimeout(yapi.WEBROOT_CONFIG.timeout);
// log
const port = yapi.WEBROOT_CONFIG.port?.toString() === "80" ? "" : ":" + yapi.WEBROOT_CONFIG.port;
//
yapi.commons.log(`服务已启动，请打开下面链接访问: \nhttp://127.0.0.1${port}/`);
