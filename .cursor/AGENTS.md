# AGENTS.md

## 架构

- **`server/`**：API / WebSocket / 业务逻辑（`common/`、`exts/`、`test/`），**不承载前端静态资源**
- **`client/`**：Next.js 前端，`client/public/` 存放 favicon、图片、iconfont、插件附件等
- **根目录**：`package.json` + `scripts/` + `deploy/` + `docs/`，勿堆后端配置或依赖

### server 分层目录

| 目录 | 职责 |
|------|------|
| `controllers/` | HTTP 薄层：鉴权、参数解析、响应包装；继承 `base.ts` |
| `services/` | 业务逻辑层，Controller 调用 Service，不直接编排 Model |
| `models/` | Mongoose 数据模型，继承 `models/base.ts` |
| `routes/` | `http/`、`ws/` 入口；`modules/*.routes.ts` 各模块路由 |
| `lib/` | Hono 适配：`bind-routes`、`context`、`action-runner` |
| `middleware/` | Mock（`mock.ts` + `mock-handler.ts`）等 |
| `utils/` | 数据库连接、通用 commons |
| `common/` | 跨模块公共逻辑（导入、Mock、插件框架） |
| `exts/` | 可选插件（各自含 controller/server） |
| `app.ts` | Hono 入口，挂载 routes 与中间件 |

## 路径约定

- `yapi.WEBROOT` = `server/` 目录
- 配置：**环境变量**（`server/.env`，见 `server/.env.example`），`config.json` 可选兜底；运行时单例 `server/runtime.ts`
- 插件：`server/exts/`
- Docker：`deploy/docker-compose.yml`（构建 context 为仓库根）
- 前端 API：`client/src/lib/api/`

## 开发（仓库根目录）

```bash
npm install --legacy-peer-deps
npm run dev
npm run test:server
npm run build
```

## 不要做的事

- 不要把 `common`、`exts`、`config.json` 放回根目录
- 不要恢复 `vendors/` 中间层
