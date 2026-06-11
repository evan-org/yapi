// @ts-nocheck
/**
 * Swagger 定时同步 HTTP 控制器（薄层）
 */
import baseController from "./base.js";
import commons from "../utils/commons.js";
import swaggerSyncService from "../services/swaggerSync.service.js";
import syncUtils from "../services/swaggerSync.scheduler.js";
import { replyServiceResult, replyException } from "./controller.util.js";

class syncController extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  async save(ctx) {
    try {
      const requestBody = ctx.request.body;
      const projectId = requestBody.project_id;
      if (!projectId) {
        ctx.body = commons.resReturn(null, 408, "缺少项目Id");
        return;
      }

      if ((await this.checkAuth(projectId, "project", "edit")) !== true) {
        ctx.body = commons.resReturn(null, 405, "没有权限");
        return;
      }

      const saved = await swaggerSyncService.saveOrUpdate(requestBody);
      if (!saved.ok) {
        return replyServiceResult(ctx, saved);
      }

      if (requestBody.is_sync_open) {
        syncUtils.addSyncJob(
          projectId,
          requestBody.sync_cron,
          requestBody.sync_json_url,
          requestBody.sync_mode,
          requestBody.uid
        );
      } else {
        syncUtils.deleteSyncJob(projectId);
      }
      replyServiceResult(ctx, saved);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async get(ctx) {
    try {
      const projectId = ctx.query.project_id;
      const result = await swaggerSyncService.getByProjectId(projectId);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }
}

export default syncController;
