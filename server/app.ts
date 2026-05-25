// @ts-nocheck
/**
 * YApi 服务入口（Hono + Node，ESM）
 * 仅提供 API / WebSocket / 公共资源；页面由 Next.js（client）承载
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createNodeWebSocket } from "@hono/node-ws";
import yapi from "./yapi.js";
import commons from "./utils/commons.js";
import dbModule from "./utils/db.js";
import mockServerHono from "./middleware/mockServerHono.js";
import storageCreator from "./utils/storage.js";
import koaCtx from "./adapter/koa-context.js";
import { assertRuntimeConfig } from "./utils/configCheck.js";
import apiRouter from "./router.js";
import registerWebSocket from "./websocket.js";

const pkg = JSON.parse(
  readFileSync(path.join(yapi.WEBROOT_SERVER, "package.json"), "utf8")
);

yapi.commons = commons;
yapi.connect = dbModule.connect();

import "./plugin.js";
import "./utils/notice.js";

globalThis.storageCreator = storageCreator;

const publicRoot = path.join(yapi.WEBROOT, "public");
const isDev = process.argv[2] === "dev";
const nextPort = process.env.YAPI_DEV_CLIENT_PORT || "4000";

/**
 * 挂载 public 下静态目录（iconfont、图片、附件等）
 */
function registerPublicAssets(app) {
  const dirs = ["iconfont", "image", "attachment"];
  dirs.forEach((dir) => {
    const root = path.join(publicRoot, dir);
    if (commons.fileExist(root)) {
      app.use(
        `/${dir}/*`,
        serveStatic({
          root,
        })
      );
    }
  });
}

/**
 * 创建并启动 Hono 应用（API 专用）
 */
async function startServer() {
  assertRuntimeConfig();

  const app = new Hono();
  const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
  yapi.app = app;

  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      framework: "hono",
      frontend: "nextjs",
      version: pkg.version,
    })
  );

  app.use("*", mockServerHono);

  apiRouter.registerToHono(app, koaCtx);
  registerWebSocket(app, upgradeWebSocket);

  registerPublicAssets(app);

  /** 非 API 请求：开发模式提示使用 Next；生产由反向代理或进程管理器转发到 Next */
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

  if (isDev) {
    commons.log(
      `开发服务已启动 (Hono API + Next.js):\n` +
        `  API:  http://127.0.0.1${port === 80 ? "" : ":" + port}/api\n` +
        `  前端: http://127.0.0.1:${nextPort}/`
    );
  } else {
    commons.log(
      `API 服务已启动 (Hono): http://127.0.0.1${port === 80 ? "" : ":" + port}/api\n` +
        `  前端请单独启动: npm run start:web`
    );
  }

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

export default { startServer };
