// @ts-nocheck
/**
 * Swagger 自动同步任务数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo.js";
import SyncModel from "../exts/yapi-plugin-swagger-auto-sync/syncModel.js";

export type SwaggerSyncRepository = LegacyModelInstance;

export const swaggerSyncRepository =
  createModelRepository<SwaggerSyncRepository>(SyncModel);
