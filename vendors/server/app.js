process.env.NODE_PATH = __dirname;
require("module").Module._initPaths();

const path = require("path");
const fs = require("fs");
const yapi = require("./yapi.js");
const commons = require("./utils/commons");
yapi.commons = commons;
const dbModule = require("./utils/db.js");
yapi.connect = dbModule.connect();
const mockServer = require("./middleware/mockServer.js");
require("./plugin.js");
const registerWebSocket = require("./websocket.js");
const storageCreator = require("./utils/storage");
require("./utils/notice");

const Fastify = require("fastify");
const fastifyStatic = require("@fastify/static");
const fastifyCookie = require("@fastify/cookie");
const fastifyFormbody = require("@fastify/formbody");
const fastifyMultipart = require("@fastify/multipart");
const fastifyWebsocket = require("@fastify/websocket");

const apiRouter = require("./router.js");
const { createKoaContext } = require("./utils/koaContext.js");
const { parseMultipartBody } = require("./utils/parseMultipart.js");

global.storageCreator = storageCreator;
const indexFile = process.argv[2] === "dev" ? "dev.html" : "index.html";
const staticRoot = yapi.path.join(yapi.WEBROOT, "static");

function wrapKoaHandler(handler) {
  return async function koaHandler(request, reply) {
    const ctx = createKoaContext(request, reply);
    await handler(ctx);
    if (!reply.sent && ctx.body !== undefined) {
      reply.send(ctx.body);
    }
  };
}

async function buildApp() {
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

module.exports = { buildApp };

async function startServer() {
  const fastify = await buildApp();
  const port = Number(yapi.WEBCONFIG.port) || 3000;

  await fastify.listen({ port, host: "0.0.0.0" });
  fastify.server.setTimeout(yapi.WEBCONFIG.timeout);

  const shutdown = async (signal) => {
    commons.log(`${signal} received, closing server...`);
    await fastify.close();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  commons.log(
    `服务已启动，请打开下面链接访问: \nhttp://127.0.0.1${port === 80 ? "" : ":" + port}/`
  );
  return fastify;
}

if (require.main === module) {
  startServer().catch((err) => {
    commons.log(err, "error");
    process.exit(1);
  });
}
