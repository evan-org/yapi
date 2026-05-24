const path = require("path");
const fs = require("fs");
const yapi = require("./yapi.js");
const mockServer = require("./middleware/mockServer.js");
const registerWebSocket = require("./websocket.js");
const apiRouter = require("./router.js");
const { createKoaContext } = require("./utils/koaContext.js");
const { parseMultipartBody } = require("./utils/parseMultipart.js");

const Fastify = require("fastify");
const fastifyStatic = require("@fastify/static");
const fastifyCookie = require("@fastify/cookie");
const fastifyFormbody = require("@fastify/formbody");
const fastifyMultipart = require("@fastify/multipart");
const fastifyWebsocket = require("@fastify/websocket");

const staticRoot = yapi.path.join(yapi.WEBROOT, "static");

/**
 * 当前入口 HTML（dev / 生产）
 */
function getIndexFile() {
  return process.argv[2] === "dev" ? "dev.html" : "index.html";
}

/**
 * 将 Koa 风格 handler 包装为 Fastify 路由处理函数
 */
function wrapKoaHandler(handler) {
  return async function koaHandler(request, reply) {
    const ctx = createKoaContext(request, reply);
    await handler(ctx);
    if (!reply.sent && ctx.body !== undefined) {
      reply.send(ctx.body);
    }
  };
}

/**
 * 创建并配置 Fastify 实例（不监听端口）
 */
async function buildApp() {
  const indexFile = getIndexFile();
  const fastify = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: 2 * 1024 * 1024
  });

  yapi.app = fastify;

  await fastify.register(fastifyCookie);
  await fastify.register(fastifyFormbody);
  await fastify.register(fastifyMultipart, {
    limits: { fileSize: 10 * 1024 * 1024 }
  });
  await fastify.register(fastifyWebsocket);

  fastify.get("/api/health", async () => ({
    status: "ok",
    framework: "fastify",
    version: require("../package.json").version
  }));

  fastify.addHook("preHandler", async (request) => {
    if (request.isMultipart()) {
      await parseMultipartBody(request);
    }
  });

  fastify.addHook("preHandler", async (request, reply) => {
    const ctx = createKoaContext(request, reply);
    await mockServer(ctx);
    if (reply.sent) {
      return;
    }
  });

  apiRouter.registerTo(fastify, wrapKoaHandler);
  registerWebSocket(fastify);

  fastify.addHook("onRequest", async (request, reply) => {
    const query = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
    let urlPath = request.url.split("?")[0];

    if (/^\/(?!api)[a-zA-Z0-9\/\-_]*$/.test(urlPath)) {
      request.url = "/" + query;
    }

    if (urlPath.indexOf("/prd") === 0) {
      reply.header("Cache-Control", "max-age=8640000000");
      const gzPath = yapi.path.join(staticRoot, urlPath + ".gz");
      if (yapi.commons.fileExist(gzPath)) {
        reply.header("Content-Encoding", "gzip");
        request.url = urlPath + ".gz" + query;
      }
    }
  });

  await fastify.register(fastifyStatic, {
    root: staticRoot,
    prefix: "/",
    decorateReply: false,
    index: indexFile,
    gzip: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".gz")) {
        res.setHeader("Content-Encoding", "gzip");
      }
    }
  });

  fastify.setNotFoundHandler(async (request, reply) => {
    const urlPath = request.url.split("?")[0];
    if (urlPath.indexOf("/api") === 0) {
      return reply.code(404).send({ errcode: 404, errmsg: "No Found" });
    }
    const indexPath = path.join(staticRoot, indexFile);
    if (fs.existsSync(indexPath)) {
      return reply.sendFile(indexFile, staticRoot);
    }
    return reply.code(404).send("Not Found");
  });

  return fastify;
}

module.exports = {
  buildApp,
  getIndexFile
};
