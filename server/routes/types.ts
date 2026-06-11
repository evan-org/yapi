// @ts-nocheck
/**
 * 路由层类型定义
 */

/**
 * 单条 HTTP 路由声明
 * @typedef {Object} RouteAction
 * @property {string} action - 控制器方法名
 * @property {string} path - URL 片段（不含 /api 与模块前缀）
 * @property {string} method - get | post | put | del | all 等
 * @property {'public' | 'login' | 'token' | 'open'} [auth] - 鉴权策略（预留，逐步接入 action-runner）
 */

/**
 * 模块路由注册配置
 * @typedef {Object} ModuleRouteConfig
 * @property {new (ctx: import('../types/app-context.js').AppContext) => object} controller
 * @property {string} prefix - 模块 URL 前缀，如 `/user/`
 * @property {RouteAction[]} routes
 */

export {};
