// @ts-nocheck
/**
 * YApi 服务入口（Hono + Node，ESM）
 *
 * 职责：
 * - /api/* REST 与 WebSocket
 * - /mock/* Mock 数据
 * - 非 API 请求在开发环境重定向到 Next.js 前端
 *
 * 页面与静态资源由 client/（Next.js）承载，不在此服务内提供。
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import yapi from "./runtime.js";
import commons from "./utils/commons.js";
import dbModule from "./utils/db.js";
import mockMiddleware from "./middleware/mock.js";
import storageCreator from "./utils/storage.js";
import { assertRuntimeConfig } from "./utils/configCheck.js";
import { mountApiRoutes, mountWebSocketRoutes } from "./routes/index.js";

const pkg = JSON.parse(
  readFileSync(path.join(yapi.WEBROOT_SERVER, "package.json"), "utf8")
);

yapi.commons = commons;
yapi.connect = dbModule.connect();

import "./plugin.js";
import "./utils/notice.js";

globalThis.storageCreator = storageCreator;

const isDev = process.argv[2] === "dev";
const nextPort = process.env.YAPI_DEV_CLIENT_PORT || "4000";

/**
 * 健康检查
 * @param {import('hono').Hono} app
 */
function registerHealthRoute(app) {
  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      framework: "hono",
      frontend: "nextjs",
      version: pkg.version,
    })
  );
}

/**
 * 非 API 路径：开发环境跳转 Next，生产返回提示 JSON
 * @param {import('hono').Hono} app
 */
function registerFrontendFallback(app) {
  app.all("*", async (c) => {
    const pathname = new URL(c.req.url).pathname;
    if (pathname.startsWith("/api")) {
      return c.json({ errcode: 404, errmsg: "接口不存在" }, 404);
    }
    if (isDev) {
      const host = c.req.header("host")?.split(":")[0] || "127.0.0.1";
      return c.redirect(`http://${host}:${nextPort}${pathname}`, 302);
    }
    return c.json(
      {
        errcode: 0,
        errmsg: "YApi API 服务运行中。请访问 Next.js 前端（默认端口 4000）。",
        data: { frontend: "nextjs", port: nextPort },
      },
      200
    );
  });
}

/**
 * 注册进程退出信号
 */
function bindShutdownSignals() {
  const shutdown = () => {
    commons.log("正在关闭服务...");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/**
 * 启动后控制台提示
 * @param {number} port
 */
function logStartup(port) {
  const hostSuffix = port === 80 ? "" : ":" + port;
  if (isDev) {
    commons.log(
      `开发服务已启动 (Hono API + Next.js):\n` +
        `  API:  http://127.0.0.1${hostSuffix}/api\n` +
        `  前端: http://127.0.0.1:${nextPort}/`
    );
  } else {
    commons.log(
      `API 服务已启动 (Hono): http://127.0.0.1${hostSuffix}/api\n` +
        `  前端请单独启动: npm run start:web`
    );
  }
}

/**
 * 创建 Hono 应用并完成路由挂载（不监听端口）
 * @returns {Promise<import('hono').Hono>}
 */
export async function createApp() {
  assertRuntimeConfig();

  const app = new Hono();
  const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
  yapi.app = app;

  registerHealthRoute(app);
  app.use("*", mockMiddleware);
  mountApiRoutes(app);
  mountWebSocketRoutes(app, upgradeWebSocket);
  registerFrontendFallback(app);

  app._injectWebSocket = injectWebSocket;
  return app;
}

/**
 * 创建应用并监听 HTTP 端口
 */
async function startServer() {
  const app = await createApp();
  const port = Number(yapi.WEBCONFIG.port) || 3001;

  const server = serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  });

  if (server && typeof server.setTimeout === "function") {
    server.setTimeout(yapi.WEBCONFIG.timeout);
  }
  if (app._injectWebSocket) {
    app._injectWebSocket(server);
  }

  bindShutdownSignals();
  logStartup(port);
  return app;
}

const isEntry =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntry) {
  startServer().catch((err) => {
    commons.log(err, "error");
    process.exit(1);
  });
}

export default { startServer, createApp };
