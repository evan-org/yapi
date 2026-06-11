# 内网部署

建议部署为 HTTP 站点。若通过 Nginx 反向代理，需为 WebSocket 配置升级头：

```
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

## 环境要求

- Node.js 18+
- PostgreSQL 12+（推荐 16）

## 方式一：Docker Compose（推荐）

```bash
cp deploy/.env.example deploy/.env   # 修改数据库密码、管理员邮箱等
docker compose -f deploy/docker-compose.yml up -d --build
# 首次部署导入表结构与默认数据：
# psql "$YAPI_DATABASE_URL" -f server/db/schema.sql
# psql "$YAPI_DATABASE_URL" -f server/db/seed.sql
```

访问 <http://127.0.0.1:4000>。默认管理员邮箱见 `YAPI_ADMIN_ACCOUNT`，初始密码 `ymfe.org`（可在个人中心修改）。

## 方式二：命令行部署

```bash
git clone 本仓库 --depth=1
cd yapi
cp server/.env.example server/.env   # 修改数据库与管理员邮箱
pnpm install
# 手动导入表结构与默认数据（示例）
# psql "postgresql://user:pass@127.0.0.1:5432/yapi" -f server/db/schema.sql
# psql "postgresql://user:pass@127.0.0.1:5432/yapi" -f server/db/seed.sql
pnpm run build
pnpm run start -- --prod
```

开发调试可使用 `pnpm run dev`（同时启动 API 与前端）。

安装后的目录结构（节选）：

```
|-- package.json
|-- server/          # API（Hono + PostgreSQL）
|   |-- .env         # 本地配置（勿提交，见 .env.example）
|   |-- controllers/
|   |-- services/
|   `-- ...
`-- client/          # Next.js 前端
```

## 进程管理

生产环境可用 pm2 管理 Node 进程，分别守护 API 与前端：

```bash
pnpm run start-server   # API，默认端口见 YAPI_PORT（3001）
pnpm run start-client   # 前端，默认 4000
```

参考：[PM2 官方文档](http://pm2.keymetrics.io/docs/usage/quick-start/)

## 升级

拉取新版本代码后，在仓库根目录执行：

```bash
git pull
pnpm install
pnpm run build
# 重启 API 与前端进程
```

## 配置邮箱

在 `server/.env`（或 Docker 的 `deploy/.env`）中设置邮件相关变量，见 `server/.env.example`：

```bash
YAPI_MAIL_ENABLE=true
YAPI_MAIL_HOST=smtp.163.com
YAPI_MAIL_PORT=465
YAPI_MAIL_FROM=noreply@example.com
YAPI_MAIL_USER=your@163.com
YAPI_MAIL_PASS=*****
```

## 配置 LDAP 登录

在 `server/.env` 设置 `YAPI_LDAP_LOGIN`（单行 JSON），例如：

```bash
YAPI_LDAP_LOGIN={"enable":true,"server":"ldap://l-ldapt1.com","baseDn":"CN=Admin,CN=Users,DC=test,DC=com","bindPassword":"password123","searchDn":"OU=UserContainer,DC=test,DC=com","searchStandard":"mail","emailPostfix":"@163.com","emailKey":"mail","usernameKey":"name"}
```

字段说明：

- `enable`：是否启用 LDAP 登录
- `server`：LDAP 地址，前缀 `ldap://` 或 `ldaps://`
- `baseDn`：绑定 DN（可选）
- `bindPassword`：绑定密码（可选）
- `searchDn`：用户查询路径
- `searchStandard`：查询字段，如 `mail`；也支持自定义 filter：`&(objectClass=user)(cn=%s)`
- `emailPostfix`：登录邮箱后缀（可选）
- `emailKey` / `usernameKey`：LDAP 中邮箱、用户名字段（可选）

重启服务后，登录页出现 LDAP 入口即表示配置成功。

<img src="./ldap.png" />

## 禁止注册

在 `server/.env` 设置 `YAPI_CLOSE_REGISTER=true`，修改后重启服务。

## 版本通知

在 `server/.env` 设置 `YAPI_VERSION_NOTIFY=true`（默认关闭），修改后重启服务。

## 配置 PostgreSQL

在 `server/.env`（Docker 用 `deploy/.env`）配置数据库连接，二选一：

- 连接串：`YAPI_DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/yapi`
- 分项：`YAPI_DB_HOST`、`YAPI_DB_PORT`（默认 5432）、`YAPI_DB_NAME`、`YAPI_DB_USER`、`YAPI_DB_PASS`

首次部署请手动执行 `server/db/schema.sql` 与 `server/db/seed.sql`，应用启动不会自动建表或写入种子数据。
