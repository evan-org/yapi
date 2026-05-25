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
cp server/config.example.json server/config.json
cp server/.env.example server/.env   # PostgreSQL，默认 127.0.0.1:5432
npm install --legacy-peer-deps
npm run install-server
npm run dev
```

- API：`server/config.json` 的 `port`（默认 3001）
- 前端：<http://127.0.0.1:4000>

| 命令 | 说明 |
|------|------|
| `npm run dev` | API + 前端 |
| `npm run dev-server` | 仅后端 |
| `npm run dev-client` | 仅前端 |
| `npm run build` | 构建前端 |
| `npm run test:server` | 后端测试 |

## Docker

```bash
cp server/config.docker.example.json server/config.json
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml exec yapi npm run install-server -w yapi-server
```

## 许可证

Apache-2.0
