# YApi

**`server/`**（Hono API）+ **`client/`**（Next.js），根目录只做 workspaces 编排。

## 目录

```text
.
├── package.json      # workspaces
├── scripts/          # 跨端构建
├── deploy/           # Docker
├── docs/             # 文档与 CHANGELOG
├── server/
└── client/
```

## 快速开始

```bash
cp server/.env.example server/.env   # 按需修改 PostgreSQL、端口、管理员邮箱
pnpm install
pnpm run install-server              # 初始化库表；默认管理员见 YAPI_ADMIN_ACCOUNT，初始密码 ymfe.org
pnpm run dev
```

- API 端口：`YAPI_PORT`（默认 3001，见 `server/.env`）
- 前端：<http://127.0.0.1:4000>（开发时 `/api`、`/mock` 由 Next 代理到 API）

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | API + 前端 |
| `pnpm run dev-server` | 仅后端 |
| `pnpm run dev-client` | 仅前端 |
| `pnpm run build` | 构建前端 |
| `pnpm run start -- --prod` | 生产模式启动前后端 |
| `pnpm run test:server` | 后端测试 |
| `pnpm run db:init` | 初始化 PostgreSQL 表结构 |

配置说明见 `server/.env.example`；复杂项（LDAP、第三方集成）使用 `YAPI_LDAP_LOGIN`、`YAPI_INTEGRATIONS` 等 JSON 环境变量。

## Docker

```bash
cp deploy/.env.example deploy/.env   # 修改数据库密码、管理员邮箱等
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml exec yapi pnpm run install-server
```

Compose 通过 `env_file` 注入环境变量。

## 许可证

Apache-2.0
