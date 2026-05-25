## 安装YApi

1.创建工程目录

```bash
mkdir yapi && cd yapi
git clone 本仓库 --depth=1 # 或者下载 zip 包解压到仓库根目录
```

2.配置环境变量

```bash
cp server/.env.example server/.env
# 编辑 server/.env：数据库、管理员邮箱、端口等
```

常用项见 `server/.env.example`。PostgreSQL 推荐 `YAPI_DATABASE_URL`，或 `YAPI_DB_HOST` + `YAPI_DB_NAME` + `YAPI_DB_USER` + `YAPI_DB_PASS`。

3.安装依赖

```bash
# 在仓库根目录
npm install  --registry https://registry.npm.taobao.org # 安装依赖
```

4.初始化

```bash
npm run install-server  # 初始化库表与管理员（邮箱见 YAPI_ADMIN_ACCOUNT）
# 默认输出
# 初始化管理员账号成功,账号名："admin@admin.com"，密码："ymfe.org"
```

5.启动开发机

```bash
npm run dev
# 访问 http://127.0.0.1:4000（前端）与 http://127.0.0.1:3001（API，端口见 YAPI_PORT）
```

目录结构（当前 monorepo）

```
|-- package.json          # workspaces：server + client
|-- scripts/
|-- deploy/
|-- docs/
|-- server/               # Hono API
|   |-- app.ts
|   |-- controllers/
|   |-- services/
|   |-- routes/
|   |-- utils/
|   |-- lib/
|   |-- .env
|   `-- test/
`-- client/               # Next.js 前端
    `-- src/
```



## 内置扩展（原 exts / npm 插件目录）

原 `server/exts/` 与插件钩子已移除，能力内置在仓库中：

| 位置 | 说明 |
|------|------|
| `server/controllers/` | advancedMock、wiki、statistics、exportData 等 HTTP 层 |
| `server/services/`、`server/services/import/` | 业务与数据导入 |
| `server/routes/modules/extensions.routes.ts` | 路由注册，HTTP 为 `/api/extensions/*` |
| `client/src/lib/features.ts` | 前端功能入口映射 |
| `client/src/lib/api/extensions.ts` | 扩展 API 客户端封装 |

第三方登录（qsso）等通过环境变量 `YAPI_INTEGRATIONS`（JSON 数组）配置，实现见 `server/services/thirdLogin.service.ts`。

## 技术栈说明

后端： Hono + PostgreSQL（JSONB）

前端： Next.js + React

## 启动开发环境服务器

```bash
  # 在仓库根目录
  npm run dev
  # 访问 http://127.0.0.1:4000（前端）
```

## 启动生产环境服务器

```bash
  # 在仓库根目录
  ykit pack -m
  node server/app.js
```