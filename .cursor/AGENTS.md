# AGENTS.md

## 架构

- **`server/`**：自包含后端（`config.json`、`common/`、`exts/`、`node_modules/`、`test/`）
- **`client/`**：Next.js 前端
- **根目录**：`package.json` + `scripts/` + `deploy/` + `docs/`，勿堆后端配置或依赖

### server 分层目录

| 目录 | 职责 |
|------|------|
| `controllers/` | HTTP 控制器，`base.ts` 基类 + 各业务 `*.ts`，统一由 `controllers/index.ts` 导出 |
| `models/` | Mongoose 数据模型，继承 `models/base.ts`，统一由 `models/index.ts` 导出 |
| `middleware/` | Mock、Hono 适配等中间件 |
| `utils/` | 数据库连接、路由工具、通用 commons |
| `common/` | 跨模块公共逻辑（导入、Mock、插件框架） |
| `exts/` | 可选插件（各自含 controller/server） |
| `router.ts` | 注册 `/api` 路由，引用 `controllers/index.ts` |

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
