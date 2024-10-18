const path = require("path");
// eslint-disable-next-line import/extensions
require("module-alias/register");
const dotEnv = require("dotenv");
dotEnv.config({ path: path.resolve(__dirname, "../.env.development") });
console.log("process.argv: ", process.argv);
/* ******************************************************************************** */
const Koa = require("koa");
//
const koaHelmet = require("koa-helmet");
// 错误处理中间件
const onerror = require("koa-onerror");
// 将JavaScript对象转换为JSON格式的响应
const koaJson = require("koa-json");
// 记录HTTP请求的详细信息和响应的状态
const koaLogger = require("koa-logger");
// Koa应用程序的静态文件服务中间件，它可以将指定目录下的静态文件（如 HTML、CSS、JavaScript、图像等）映射到 Web 服务器上，并提供对这些文件的访问
const koaStatic = require("koa-static");
// Koa 应用程序的跨域资源共享 (Cross-Origin Resource Sharing, CORS) 中间件。它添加了必要的 HTTP 响应头，以便在浏览器中处理跨域请求。
const koaCors = require("@koa/cors");
// 处理请求体的中间件，它可以解析和处理来自客户端的请求数据（如表单数据、JSON 数据、文件上传等）。它使得在 Koa 应用程序中处理请求数据变得更加简单和方便。
// const koaBodyparser = require("koa-bodyparser");
// 处理请求体的中间件，它可以解析和处理来自客户端的请求数据（如表单数据、JSON 数据、文件上传等）。它使得在 Koa 应用程序中处理请求数据变得更加简单和方便。
const koaBody = require("koa-body");
// Koa 应用程序中添加 WebSocket 支持的中间件。它基于 Node.js 的内置 WebSocket 模块，并提供了简单易用的接口，使得在 Koa 应用程序中处理 WebSocket 的通信变得更加方便。
const koaWebsocket = require("koa-websocket");
/* ******************************************************************************** */
// 全局挂载
const yapi = require("./yapi.js");
const commons = require("./utils/commons.js");
const useMongodb = require("./helper/mongodb.js");
const storageCreator = require("./utils/storage.js");
yapi.commons = commons;
yapi.connect = useMongodb.connect();
yapi.storageCreator = storageCreator;
/* ******************************************************************************** */
// // Exts插件装载
// const ExtsPlugin = require("./plugins/ExtsPlugin.js");
// ExtsPlugin();
// // Notice插件装载
// const NoticePlugin = require("./plugins/NoticePlugin.js");
// NoticePlugin();
/* ******************************************************************************** */
const app = koaWebsocket(new Koa());
const yapiMiddleware = require("./middleware/yapi.js");
const { websocketMiddleware } = require("./middleware/index.js");
// 错误处理中间件
onerror(app);
// 加载 yapi 中间件
app.use(yapiMiddleware(yapi));
// 使用 koa-helmet 中间件
app.use(koaHelmet());
// 处理跨域请求
app.use(koaCors({
  // 任何地址都可以访问
  origin: "*",
  // 指定地址才可以访问
  maxAge: 2592000,
  // 必要配置
  credentials: true
}));
// 日志中间件
app.use(koaLogger());
// 处理静态文件
const indexFile = process.argv[2] === "dev" ? "dev.html" : "index.html";
app.use(koaStatic(yapi.path.join(yapi.WEBROOT, "static"), { index: indexFile, gzip: true }));
// 解析请求的 body 数据
// app.use(koaBodyparser());
app.use(koaBody({ strict: false, multipart: true, jsonLimit: "2mb", formLimit: "1mb", textLimit: "1mb" }));
// 处理 crx
app.use(koaJson());
// WebSocket 中间件
websocketMiddleware(app);
// 路由处理
// const router = require("./routes/router.js");
// app.proxy = true;
// app.use(router.routes()).use(router.allowedMethods());
// console.log("router.routes()", router.routes());
const router = require("./routes/index.js");
app.use(router());
// 启动服务器
const server = app.listen(yapi.WEBROOT_CONFIG.port);
server.setTimeout(yapi.WEBROOT_CONFIG.timeout);
app.context.yapi = yapi;
module.exports = app;
// 日志输出
const port = yapi.WEBROOT_CONFIG.port?.toString() === "80" ? "" : ":" + yapi.WEBROOT_CONFIG.port;
yapi.commons.log(`服务已启动，请打开下面链接访问: \nhttp://127.0.0.1${port}/`);
