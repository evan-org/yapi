# AGENTS.md

面向 AI 编码助手（Cursor、Cloud Agent 等）的本仓库协作说明。人类开发者也可作架构速查。

**Cursor 项目规则**：`.cursor/rules/*.mdc`（`alwaysApply` + `globs` 分层，与本文档同步，优先防止架构偏移）。

## 项目是什么

YApi 接口管理平台 fork：业务逻辑在 `server/`（Hono），UI 在 `client/`（Next.js 15 App Router + shadcn/ui）。**不要**再引用已删除的 `vendors/` 包装层、旧 Vite 客户端或 `static/prd` 构建链。

## 技术栈

| 区域 | 技术 |
|------|------|
| 后端 | Node.js、Hono、`@hono/node-server`、Mongoose、插件钩子 `yapi.emitHook` |
| 前端 | Next.js 15、React 19、TypeScript、Tailwind CSS、shadcn/ui、Lucide |
| 数据 | MongoDB |
| 配置 | 仓库根目录 `config.json` |

## 目录地图（改代码前先定位）

```text
server/app.js              # Hono 入口；非 /api 开发态跳转 Next
server/router.js           # REST 路由注册
server/controllers/        # 业务控制器
server/middleware/         # Mock 等中间件
client/src/app/            # Next App Router 页面
client/src/lib/api/        # 浏览器 API 客户端（fetch + Cookie）
client/src/components/     # UI 与业务组件
client/next.config.ts      # /api → YAPI_API_URL 反代
common/                    # 前后端共用逻辑
exts/                      # 插件（勿在 Next 中 require 旧 client.js）
scripts/                   # build-next-client、generate-plugin-module 等
config.json                # 根配置（CI 用 config_example.json 复制）
```

## 开发命令

均在**仓库根目录**执行：

```bash
npm run dev              # API + Next
npm run dev-server       # 仅 API（默认端口见 config）
npm run dev-client       # 仅 Next :4000
npm run build            # Next 生产构建 + 校验
npm run test:server      # ava，改 server/common 后应跑
npm run lint:client      # 改 client/ 后建议跑
```

根目录 Docker：`docker compose up -d --build`（见 `README.md`）。

## 前端约定

1. **路径别名**：`client/` 内使用 `@/` 指向 `src/`。
2. **API 调用**：统一走 `client/src/lib/api/`，`apiRequest` 带 `credentials: "include"`。
3. **登录态**：`AuthProvider` + `/api/user/status`。
4. **页面**：需登录工作台放在 `app/(dashboard)/`，登录页在 `app/login/`。
5. **插件 UI**：对接 `/api/plugin/*`、`/api/open/*`，映射见 `generate-plugin-module.js`。

## 后端约定

1. 新路由在 `server/router.js` 注册，逻辑写在 `server/controllers/`。
2. 插件通过 `exts/` + `server/plugin.js` 加载。
3. `yapi.WEBROOT` 指向仓库根目录（与 `server/`、`client/` 同级）。
4. 保持 `console` 日志；不要批量删除既有日志。

## Git / PR（Cloud Agent）

- 从 `main` 拉功能分支，命名：`cursor/<描述>-5bb5`。
- 提交前：`npm run build`、`npm run test:server`（根目录）。
- 不要 force-push `main`。

## 不要做的事

- 不要恢复 `vendors/` 中间目录或 Vite 正式前端。
- 不要在 Next 中 `require` 插件目录下的旧 `client.js`。

## 参考

- 人类可读说明：根目录 `README.md`
- 历史文档：`docs/`
