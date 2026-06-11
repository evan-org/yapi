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
cp server/.env.example server/.env.local   # 填入数据库等私密配置（勿提交 Git）
cp client/.env.example client/.env.local   # 可选，API 代理地址
pnpm install
# 在 PostgreSQL 中创建数据库后，手动导入表结构与默认数据：
#   psql "$YAPI_DATABASE_URL" -f server/db/schema.sql
#   psql "$YAPI_DATABASE_URL" -f server/db/seed.sql
pnpm run dev
```

- API 端口：`YAPI_PORT`（默认 7102，见 `server/.env`）
- 前端：<http://127.0.0.1:7101>（开发时 `/api`、`/mock` 由 Next 代理到 API）

| 命令 | 说明 |
|------|------|
| `pnpm run dev` | API + 前端 |
| `pnpm run dev-server` | 仅后端 |
| `pnpm run dev-client` | 仅前端 |
| `pnpm run build` | 构建前端 |
| `pnpm run start -- --prod` | 生产模式启动前后端 |
| `pnpm run test:server` | 后端测试 |

配置说明见 `server/.env.example`；复杂项（LDAP、第三方集成）使用 `YAPI_LDAP_LOGIN`、`YAPI_INTEGRATIONS` 等 JSON 环境变量。

## Docker

```bash
cp deploy/.env.example deploy/.env   # 修改数据库密码、管理员邮箱等
docker compose -f deploy/docker-compose.yml up -d --build
# 首次启动后导入：schema.sql + seed.sql（见 server/db/）
```

Compose 通过 `env_file` 注入环境变量。

## 许可证

Apache-2.0
