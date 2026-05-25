# YApi

可视化 API 管理平台。本仓库在经典 YApi 基础上完成现代化改造：**后端 Hono（Node）+ 前端 Next.js 15（App Router）+ shadcn/ui**，原 Vite/React 单页应用已移除。

官方文档：<https://hellosean1025.github.io/yapi/>

## 架构

| 层级 | 路径 | 说明 |
|------|------|------|
| 前端 | `client/` | Next.js 15、Tailwind、shadcn/ui，`/api` 反代到后端 |
| API | `server/` | Hono 路由、WebSocket、Mock、`public/` 静态资源 |
| 共享 | `common/` | 工具、Mock、插件钩子、Postman 库等 |
| 插件 | `exts/` | 服务端插件（统计、Wiki、导入导出等） |
| 配置 | 根目录 `config.json` | 端口、MongoDB、邮件等（勿提交敏感信息） |

开发时 API 默认 `3001`，Next 默认 `4000`；开发入口 `3000` 会跳转到 Next。

## 目录结构

```text
.
├── config.json              # 运行配置（本地 / Docker 挂载）
├── config_example.json
├── config.docker.example.json
├── docker-compose.yml
├── Dockerfile
├── package.json             # 根脚本与后端依赖
├── server/                  # Hono 后端
├── client/                  # Next.js 前端
├── common/
├── exts/                    # 插件
├── scripts/                 # 构建、插件注册表生成
├── test/
└── README.md
```

## 环境要求

- Node.js **18+**（推荐 18 LTS）
- MongoDB **2.6+**（推荐 4.x）
- npm

## 快速开始（本地开发）

### 1. 配置

```bash
cp config_example.json config.json
# 按需修改 MongoDB、adminAccount 等
```

### 2. 安装依赖

```bash
npm ci --legacy-peer-deps
cd client && npm ci --legacy-peer-deps && cd ..
```

### 3. 初始化数据库（首次）

```bash
node server/install.js
# 默认管理员密码: ymfe.org
```

### 4. 启动

```bash
npm run dev
```

- 浏览器访问：<http://127.0.0.1:4000>
- 仅 API：`npm run dev-server`
- 仅前端：`npm run dev-client`

## 构建与生产

```bash
npm run build          # Next 生产构建 + 校验
npm run start          # API + Next（生产）
npm run start:api      # 仅 API
npm run start:client   # 仅 Next（需 API 可访问）
```

前端构建产物：`client/.next/`。

## Docker

```bash
cp config.docker.example.json config.json
docker compose up -d --build
docker compose exec yapi node server/install.js
```

容器内由 `docker-entrypoint.sh` 启动 Hono（内网 **3000**）与 Next（对外 **4000**）。

## 常用脚本（仓库根目录）

| 命令 | 说明 |
|------|------|
| `npm run dev` | API + Next 开发 |
| `npm run build` | 生产构建 Next 前端 |
| `npm run test:server` | 服务端单元测试 |
| `npm run lint:client` | Next 前端 ESLint |
| `npm run install-server` | 数据库初始化 |

## 前端主要路由

| 路径 | 功能 |
|------|------|
| `/login` | 登录 / 注册 |
| `/group` | 分组列表 |
| `/group/[groupId]` | 项目、成员、分组设置 |
| `/project/[id]/interface/api` | 接口管理 |
| `/project/[id]/interface/col` | 测试集合 |
| `/project/[id]/wiki` | 项目 Wiki |
| `/project/[id]/setting` | 项目设置（含导入导出） |
| `/statistic` | 系统统计（管理员） |

## 插件

服务端插件位于 `exts/`，在 `config.json` 的 `plugins` 中启用。Next 端通过 `client/src/lib/plugins/registry.ts`（构建前由 `scripts/generate-plugin-module.js` 生成）映射到设置页、Wiki、统计等路由。

## 测试与 CI

```bash
npm run test:server
```

GitHub Actions：`.github/workflows/ci.yml`。

## 许可证

Apache-2.0，详见 `LICENSE` 与上游 YApi 说明。
