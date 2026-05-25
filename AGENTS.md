# AGENTS.md

面向 AI 编码助手（Cursor、Cloud Agent 等）的本仓库协作说明。人类开发者也可作架构速查。

**Cursor 项目规则**：`.cursor/rules/*.mdc`（`alwaysApply` + `globs` 分层，与本文档同步，优先防止架构偏移）。

## 项目是什么

YApi 接口管理平台 fork：业务逻辑在 `vendors/server`（Hono），UI 在 `vendors/web`（Next.js 15 App Router + shadcn/ui）。**不要**再引用或恢复已删除的 `vendors/client/`、Vite、`static/prd` 前端构建链。

## 技术栈

| 区域 | 技术 |
|------|------|
| 后端 | Node.js、Hono、`@hono/node-server`、Mongoose、插件钩子 `yapi.emitHook` |
| 前端 | Next.js 15、React 19、TypeScript、Tailwind CSS、shadcn/ui、Lucide |
| 数据 | MongoDB |
| 配置 | 仓库根目录 `config.json` |

## 目录地图（改代码前先定位）

```text
vendors/server/app.js          # Hono 入口；非 /api 开发态跳转 Next
vendors/server/router.js       # REST 路由注册
vendors/server/controllers/    # 业务控制器
vendors/server/middleware/     # Mock 等中间件
vendors/web/src/app/           # Next App Router 页面
vendors/web/src/lib/api/       # 浏览器 API 客户端（fetch + Cookie）
vendors/web/src/components/    # UI 与业务组件
vendors/web/next.config.ts     # /api → YAPI_API_URL 反代
vendors/common/                # 前后端共用逻辑
vendors/exts/                  # 插件（含旧 client.js，勿在 Next 中 require）
vendors/scripts/               # build-next-client、generate-plugin-module 等
config.json                    # 根配置（CI 用 vendors/config_example.json 复制）
```

## 开发命令

均在 `vendors/` 目录执行（除非注明）：

```bash
npm run dev              # API + Next
npm run dev-server       # 仅 API（默认端口见 config）
npm run dev-client       # 仅 Next :4000
npm run build            # prebuild 会生成 plugin registry
npm run test:server      # ava，改 server/common 后应跑
npm run lint:web         # 改 web/ 后建议跑
```

根目录 Docker：`docker compose up -d --build`（见 `README.md`）。

## 前端约定

1. **路径别名**：`vendors/web` 内使用 `@/` 指向 `src/`（如 `@/lib/api/client`）。
2. **API 调用**：统一走 `vendors/web/src/lib/api/`，`apiRequest` 带 `credentials: "include"`；标准响应 `{ errcode, errmsg, data }`，`errcode === 0` 为成功。
3. **登录态**：`AuthProvider` + `/api/user/status`；`ladp`、`canRegister` 在响应顶层字段（非仅 `data`）。
4. **页面**：需登录工作台放在 `app/(dashboard)/`，登录页在 `app/login/`。
5. **插件 UI**：旧 React 插件页已废弃；新能力用 Next 页面或 `ProjectDataPanel` 等组件对接 `/api/plugin/*`、`/api/open/*`。
6. **禁止**在未要求时恢复 Ant Design / Redux / Vite 依赖。

## 后端约定

1. 新路由在 `router.js` 注册，逻辑写在 `controllers/`。
2. 插件通过 `vendors/exts` + `server/plugin.js` 加载；HTTP 插件路由前缀 `/api/plugin/{path}`。
3. 改 `common/` 时注意 `mockServer`、测试对 `js-base64` 等依赖仍存在于 `vendors/package.json`。
4. 保持 `console` 日志；不要批量删除既有 `console.error` / `console.log`（除非用户明确要求）。

## 代码风格（用户规则摘要）

- **最小改动**：只改与任务相关的文件。
- **注释**：非显而易见逻辑用中文注释说明意图。
- **不要**主动新增与用户任务无关的 markdown 文档（除用户点名的 README/AGENTS 等）。
- **不要**删除 `console`。
- 匹配周边命名与 shadcn 组件用法；避免过度抽象。

## Git / PR（Cloud Agent）

- 从 `main` 拉功能分支，命名：`cursor/<描述>-5bb5`（全小写）。
- 提交前：`npm run build`、`npm run test:server`（在 `vendors/`）。
- 推送：`git push -u origin <branch>`；用 PR 工具更新 PR，`base_branch` 一般为 `main`。
- 不要 force-push `main`。

## 常见任务指引

| 任务 | 建议 |
|------|------|
| 新页面 | `vendors/web/src/app/.../page.tsx` + 可选 `lib/api/*.ts` |
| 新接口封装 | `vendors/web/src/lib/api/*.ts` 并 export 自 `client.ts` |
| 项目设置/导入导出 | 参考 `components/project/project-data-panel.tsx`、`lib/api/open.ts` |
| 成员管理 | `components/shared/member-panel.tsx` + `groupApi` / `projectApi` |
| 插件注册表 | 改 `scripts/generate-plugin-module.js`，勿手改生成结果长期留存 |
| 服务端 bug | 控制器 + `test/server/` 补测 |

## 易错点

- `predev` / `prebuild` 会**覆盖** `web/src/lib/plugins/registry.ts` 的 `enabledPluginNames`；扩展 Next 插件映射请改生成脚本。
- Next 构建在 `vendors/web` 子包执行，根 `vendors/package.json` 的 `build` 会调用 `scripts/build-next-client.js`。
- 开放导入：`POST /api/open/import_data`，需项目 `token`（见 `projectApi.getToken`）。
- `userApi.resolve(type, id)` 用于顶栏搜索跳转（interface / project / group）。

## 不要做的事

- 不要重新引入 `vendors/client` 或 Vite 作为正式前端。
- 不要在 Next 中 `require` 插件目录下的旧 `client.js`（路径已失效）。
- 不要未经用户要求生成额外总结类 md 文件。
- 不要估算「需要几天」；用技术范围描述工作量即可。

## 参考链接

- 上游文档：<https://hellosean1025.github.io/yapi/>
- 人类可读说明：根目录 `README.md`
- 详细历史说明：`vendors/README.md`、`vendors/docs/`
