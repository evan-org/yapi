# server/ 架构说明

参考 [Cloudflare-Evan-ImageBed/functions](https://github.com/EvanNotFound/Cloudflare-Evan-ImageBed/tree/main/functions) 的分层约定，YApi 后端采用 **单向四层依赖**：

```
handlers/ → routes/ → controllers/ → services/ → repositories/ → db/
```

## 目录职责

| 目录 | 职责 |
|------|------|
| `app.ts` | 进程入口：连接 DB、启动调度、监听端口 |
| `handlers/` | Hono 应用装配（中间件、路由挂载） |
| `routes/` | 路由声明与 Action 绑定，不写业务 |
| `controllers/` | HTTP 薄层：鉴权上下文、参数解析、调 Service |
| `services/` | 业务逻辑与跨表编排，不依赖 Hono Context |
| `repositories/` | 表级 SQL（`*.repo.ts`），方法名体现数据动作 |
| `shared/` | 横切契约：`config.ts`（配置出口）、`clock.ts`（时间戳）、`response.ts`（API 信封） |
| `services/auth.service.ts` | 登录态、OpenAPI Token、项目/分组角色鉴权；`bootstrapControllerSession` 供 `base.ts` init |
| `middleware/` | Mock、鉴权等横切中间件 |
| `db/` | 连接池、schema、行映射 |
| `lib/` | action-runner、context 适配、路由绑定 |
| `utils/` | 纯工具函数（`app-log.ts` 等，**不含** DB 访问） |
| `services/notification.service.ts` | 操作日志、邮件、项目通知 |
| `services/interface/` | 接口子模块：`query` / `category` / `mutation` / `upload`，由 `interface.service.ts` 门面聚合 |
| `services/interfaceCol/` | 测试集合子模块：`query` / `col` / `case` / `script`，由 `interfaceCol.service.ts` 门面聚合 |
| `services/project/` | 项目子模块：`query` / `mutation` / `member` / `token`，由 `project.service.ts` 门面聚合 |
| `services/user/` | 用户子模块：`auth` / `profile` / `query` / `admin`，由 `user.service.ts` 门面聚合 |
| `types/` | 类型定义 |

## 依赖规则

1. **禁止** Controller 直接写 SQL
2. **禁止** Route 写业务逻辑
3. **禁止** Service 依赖 Hono `Context`（WebSocket 等特殊场景可保留在 Controller）
4. 新功能必须走 `ServiceResult` + `replyServiceResult` 响应路径
5. 数据访问统一经 `repositories/*.repo.ts`（`models/` 已删除）；`up_time` 等时间戳用 `shared/clock.nowSeconds()`，禁止 repo 依赖 `yapi.commons`；Service 层新代码优先 `nowSeconds` 而非 `commons.time()`
6. Controller **禁止** `import repositories/`（鉴权前加载实体用 Service 的 `require*` / `getProjectBaseInfo` 等）

## 请求链路

```
app.ts → handlers/http.ts → routes/modules/*.routes.ts
  → lib/action-runner.ts → controllers/*.ts → services/*.ts → repositories/*.repo.ts
```

## 命名约定

| 层级 | 文件模式 | 导出 |
|------|----------|------|
| 路由模块 | `routes/modules/{name}.routes.ts` | `register{Name}Routes` |
| 控制器 | `controllers/{name}.ts` | default class |
| 服务 | `services/{name}.service.ts` | default singleton |
| 仓储 | `repositories/{name}.repo.ts` | `{name}Repository` |
