// @ts-nocheck
/**
 * 应用内置功能初始化（导入注册表、Swagger 定时同步等）
 */
import { initImportDataRegistry } from "../services/import/registry.js";
import "../services/swaggerSync.scheduler.js";

initImportDataRegistry();
