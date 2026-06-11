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
import { serve } from "@hono/node-server";
import yapi from "./runtime.js";
import commons from "./utils/commons.js";
import dbModule from "./utils/db.js";
import storageCreator from "./utils/storage.js";
import { assertRuntimeConfig } from "./utils/configCheck.js";
import { createHttpApp } from "./handlers/http.js";

yapi.commons = commons;

import "./bootstrap/features.js";
import notificationService from "./services/notification.service.js";
import syncUtils from "./services/swaggerSync.scheduler.js";

globalThis.storageCreator = storageCreator;

const isDev = process.argv[2] === "dev";

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
  notificationService.attachToCommons(yapi.commons);
  assertRuntimeConfig();
  return createHttpApp();
}

/**
 * 创建应用并监听 HTTP 端口
 */
async function startServer() {
  await dbModule.connect();
  await syncUtils.start();
  const app = await createApp();
  const port = Number(yapi.WEBCONFIG.port) || 7102;

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
