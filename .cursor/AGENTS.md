# AGENTS.md

## 架构

- **`server/`**：API / WebSocket / 业务逻辑（`controllers/`、`services/`、`utils/`、`lib/`、`test/`），**不承载前端静态资源**
- **`client/`**：Next.js 前端，`client/public/` 存放 favicon、图片、iconfont、静态资源等
- **根目录**：`package.json` + `scripts/` + `deploy/` + `docs/`，勿堆后端配置或依赖

### server 分层目录

| 目录 | 职责 |
|------|------|
| `controllers/` | HTTP 薄层：鉴权、参数解析、响应包装；继承 `base.ts` |
| `services/` | 业务逻辑层，Controller 调用 Service，不直接编排 Model |
| `models/` | 数据模型（PostgreSQL），继承 `models/base.ts` |
| `routes/` | `http/`、`ws/` 入口；`modules/*.routes.ts` 各模块路由 |
| `lib/` | Hono 适配、`api-response` 统一响应契约 |
| `middleware/` | Mock（`mock.ts` + `mock-handler.ts`）等 |
| `utils/` | `commons`、Mock/Schema 工具、差异对比、Markdown 等 |
| `services/import/` | 数据导入（Postman/HAR/Swagger/YApi JSON） |
| `app.ts` | Hono 入口，挂载 routes 与中间件 |

## 路径约定

- `yapi.WEBROOT` = `server/` 目录
- 配置：**仅环境变量**（`server/.env` ← `.env.example`；Docker 用 `deploy/.env`）；`server/config/load-config.ts`
- 内置能力 API：`/api/wiki`、`/api/statistics/*`、`/api/export/*`、`/api/advanced-mock/*`、`/api/swagger-sync` 等独立模块路由
- Docker：`deploy/docker-compose.yml`（构建 context 为仓库根）
- 前端 API：`client/src/lib/api/`

## 开发（仓库根目录）

```bash
pnpm install
pnpm run dev
pnpm run test:server
pnpm run build
```

## 不要做的事

- 配置仅 `server/.env` / `YAPI_*`
- 不要引入 MongoDB / Mongoose 或恢复已移除的插件打包层
