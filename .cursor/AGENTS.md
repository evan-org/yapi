# AGENTS.md

## 架构

- **`server/`**：自包含后端（`config.json`、`common/`、`exts/`、`node_modules/`、`test/`）
- **`client/`**：Next.js 前端
- **根目录**：`package.json` + `scripts/` + `deploy/` + `docs/`，勿堆后端配置或依赖

## 路径约定

- `yapi.WEBROOT` = `server/` 目录
- 配置：`server/config.json`；后端源码为 **TypeScript**（`*.ts`），`npm run dev` 使用 `tsx` + `nodemon`
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
