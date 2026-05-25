# YApi

可视化 API 管理平台：**`server/`**（Hono API）+ **`client/`**（Next.js 前端），根目录仅做 monorepo 编排。

## 目录结构

```text
.
├── package.json           # workspaces 编排（server + client）
├── scripts/               # 跨端构建脚本（读 server 配置、写 client 产物）
├── server/                # 后端独立工作区
│   ├── app.js
│   ├── config.json        # 运行时配置（勿提交，见 config.example.json）
│   ├── common/
│   ├── exts/
│   ├── public/
│   ├── static/
│   ├── test/
│   └── package.json
└── client/                # 前端独立工作区
    └── package.json
```

## 快速开始

```bash
cp server/config.example.json server/config.json
# 编辑 server/config.json

npm install --legacy-peer-deps
npm run install-server
npm run dev
```

- API：见 `server/config.json` 的 `port`（默认 3001）
- 前端：<http://127.0.0.1:4000>

## 常用命令（仓库根目录）

| 命令 | 说明 |
|------|------|
| `npm run dev` | API + 前端 |
| `npm run dev-server` | 仅 `server/` |
| `npm run dev-client` | 仅 `client/` |
| `npm run build` | 构建前端 |
| `npm run test:server` | 服务端测试 |

## Docker

```bash
cp server/config.docker.example.json server/config.json
docker compose up -d --build
docker compose exec yapi npm run install-server -w yapi-server
```

配置文件挂载：`./server/config.json` → 容器内 `/yapi/server/config.json`。

## 许可证

Apache-2.0
