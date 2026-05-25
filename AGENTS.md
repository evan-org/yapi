# AGENTS.md

## 架构

- **`server/`**：自包含后端（`config.json`、`common/`、`exts/`、`node_modules/`、`test/` 均在此目录）
- **`client/`**：Next.js 前端
- **根目录**：仅 `package.json`（workspaces）+ `scripts/`（跨端构建），**不要**把后端依赖或配置堆在根目录

## 路径约定

- `yapi.WEBROOT` = `server/` 目录本身
- 配置：`server/config.json`，示例 `server/config.example.json`
- 插件：`server/exts/`
- 前端 API 封装：`client/src/lib/api/`

## 开发命令（根目录）

```bash
npm install --legacy-peer-deps
npm run dev
npm run test:server
npm run build
```

## 不要做的事

- 不要把 `common`、`exts`、`config.json` 放回仓库根目录
- 不要恢复 `vendors/` 中间层
