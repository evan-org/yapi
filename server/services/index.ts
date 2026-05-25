/**
 * 业务服务层入口
 *
 * 约定：
 * - services/ 封装业务逻辑与 Model 编排，不依赖 HTTP ctx
 * - controllers/ 负责鉴权上下文、参数解析、resReturn 包装
 * - 新功能优先写 Service，Controller 保持薄层
 */
export { default as BaseService } from "./base.service.js";
export { ok, fail } from "./service-result.js";
export type { ServiceResult, ServiceOk, ServiceFail } from "./service-result.js";
export { default as followService } from "./follow.service.js";
export { default as logService } from "./log.service.js";
export { default as userService } from "./user.service.js";
export { default as groupService } from "./group.service.js";
export { default as projectService } from "./project.service.js";
export { default as openService } from "./open.service.js";
export { default as interfaceService } from "./interface.service.js";
export { default as interfaceColService } from "./interfaceCol.service.js";
export { default as exportDataService, stripExportIds } from "./exportData.service.js";
export { default as swaggerSyncService } from "./swaggerSync.service.js";
