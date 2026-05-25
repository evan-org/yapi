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
npm install --legacy-peer-deps
npm run install-server
npm run dev
```

- API 端口：`YAPI_PORT`（默认 3001，见 `server/.env`）
- 前端：<http://127.0.0.1:4000>

| 命令 | 说明 |
|------|------|
| `npm run dev` | API + 前端 |
| `npm run dev-server` | 仅后端 |
| `npm run dev-client` | 仅前端 |
| `npm run build` | 构建前端 |
| `npm run test:server` | 后端测试 |
| `npm run db:init` | 初始化 PostgreSQL 表结构 |

配置说明见 `server/.env.example`；复杂项（LDAP、第三方集成）使用 `YAPI_LDAP_LOGIN`、`YAPI_INTEGRATIONS` 等 JSON 环境变量。

## Docker

```bash
cp deploy/.env.example deploy/.env   # 修改数据库密码、管理员邮箱等
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml exec yapi npm run install-server -w yapi-server
```

Compose 通过 `env_file` 注入环境变量，无需挂载 `config.json`。

## 许可证

Apache-2.0
