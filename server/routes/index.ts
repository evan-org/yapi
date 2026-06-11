// @ts-nocheck
/**
 * 路由层入口
 *
 * routes/
 * ├── http/          REST API 模块路由
 * ├── ws/            WebSocket 路由
 * ├── modules/       各业务模块路由表
 * ├── register-routes.ts
 * └── types.ts
 */
export { mountApiRoutes } from "./http/index.js";
export { mountWebSocketRoutes } from "./ws/index.js";
