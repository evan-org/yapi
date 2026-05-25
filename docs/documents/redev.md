## 安装YApi

1.创建工程目录

```bash
mkdir yapi && cd yapi
git clone 本仓库 --depth=1 # 或者下载 zip 包解压到仓库根目录
```

2.修改配置

```bash
cp config_example.json ./config.json # 复制完成后请修改相关配置
vi ./config.json
```

配置如下，主要配置 PostgreSQL 数据库，以及 Admin 账号。

```json
{
  "port": "3011",
  "adminAccount": "admin@admin.com",
  "db": {
    "servername": "127.0.0.1",
    "DATABASE":  "yapi",
    "port": 5432,
    "user": "yapi",
    "pass": "yapi123"
  },
  "mail": {
    "enable": true,
    "host": "smtp.163.com",
    "port": 465,
    "from": "***@163.com",
    "auth": {
        "user": "***@163.com",
        "pass": "*****"
    }
  }
}
```
> db.user 和 db.pass 是 PostgreSQL 的用户名和密码；也可使用环境变量 `YAPI_DATABASE_URL`。

3.安装依赖

```bash
# 在仓库根目录
npm install  --registry https://registry.npm.taobao.org # 安装依赖
```

4.初始化

```bash
npm run install-server  # 安装程序会初始化数据库索引和管理员账号，管理员账号名可在 config.json 配置
# 默认输出
# 初始化管理员账号成功,账号名："admin@admin.com"，密码："ymfe.org"
```

5.启动开发机

```bash
npm run dev
# 启动服务器后，请访问 127.0.0.1:{config.json配置的端口}，初次运行会有个编译的过程，请耐心等候
# 127.0.0.1:3011
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
|   |-- config.json
|   `-- test/
`-- client/               # Next.js 前端
    `-- src/
```



## 内置扩展（原 exts / npm 插件目录）

原 `server/exts/` 与插件钩子已移除，能力内置在仓库中：

| 位置 | 说明 |
|------|------|
| `server/controllers/` | advMock、wiki、statistics、export 等 HTTP 层 |
| `server/services/`、`server/services/import/` | 业务与数据导入 |
| `server/routes/modules/extensions.routes.ts` | 路由注册，HTTP 仍为 `/api/plugin/*` |
| `client/src/lib/features.ts` | 前端功能入口映射 |
| `client/src/lib/api/extensions.ts` | 扩展 API 客户端封装 |

第三方登录（qsso）等仍可通过 `config.json` 的 `plugins` 或环境变量 `YAPI_PLUGINS` 配置，实现见 `server/services/thirdLogin.service.ts`。

## 技术栈说明

后端： Hono + PostgreSQL（JSONB）

前端： Next.js + React

## 启动开发环境服务器

```bash
  # 在仓库根目录
  npm run dev
  # 启动服务器后，请访问 127.0.0.1:{config.json配置的端口}，初次运行会有个编译的过程，请耐心等候
```

## 启动生产环境服务器

```bash
  # 在仓库根目录
  ykit pack -m
  node server/app.js
```