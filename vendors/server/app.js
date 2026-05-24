process.env.NODE_PATH = __dirname;
require("module").Module._initPaths();

const yapi = require("./yapi.js");
const commons = require("./utils/commons");
yapi.commons = commons;

const dbModule = require("./utils/db.js");
yapi.connect = dbModule.connect();

require("./plugin.js");
const storageCreator = require("./utils/storage");
require("./utils/notice");

const { buildApp } = require("./fastifyApp.js");

global.storageCreator = storageCreator;

/**
 * 启动 HTTP 服务
 */
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

module.exports = { buildApp, startServer };

if (require.main === module) {
  startServer().catch((err) => {
    commons.log(err, "error");
    process.exit(1);
  });
}
