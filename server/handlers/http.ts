// @ts-nocheck
/**
 * HTTP 应用装配：中间件、路由挂载、前端回退
 *
 * 参考 Cloudflare-Evan-ImageBed functions/handlers/http.ts：
 * 入口只做转发，业务路由在 routes/，具体逻辑在 controllers → services → repositories
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import yapi from "../runtime.js";
import mockMiddleware from "../middleware/mock.js";
import { mountApiRoutes, mountWebSocketRoutes } from "../routes/index.js";

const pkg = JSON.parse(
  readFileSync(path.join(yapi.WEBROOT_SERVER, "package.json"), "utf8")
);

const isDev = process.argv[2] === "dev";
const nextPort = process.env.YAPI_DEV_CLIENT_PORT || "7101";

/** 健康检查 */
function registerHealthRoute(app: Hono) {
  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      framework: "hono",
      frontend: "nextjs",
      version: pkg.version,
    })
  );
}

/** 非 API 路径：开发环境跳转 Next，生产返回提示 JSON */
function registerFrontendFallback(app: Hono) {
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
        errmsg: "YApi API 服务运行中。请访问 Next.js 前端（默认端口 7101）。",
        data: { frontend: "nextjs", port: nextPort },
      },
      200
    );
  });
}

/**
 * 创建 Hono 应用并完成路由挂载（不监听端口）
 */
export async function createHttpApp() {
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
