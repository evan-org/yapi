// @ts-nocheck
import baseController from "../../../controllers/base.js";
import yapi from "runtime.js";
import {
  projectRepository,
} from "../../../repositories/index.js";
import { swaggerSyncRepository } from "../../../repositories/swaggerSync.repo.js";
import swaggerSyncService from "../../../services/swaggerSync.service.js";
import syncUtils from "../interfaceSyncUtils.js";

class syncController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.syncModel = swaggerSyncRepository;
    this.projectModel = projectRepository;
  }

  /**
   * 保存定时任务
   */
  async upSync(ctx) {
    let requestBody = ctx.request.body;
    let projectId = requestBody.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, "缺少项目Id"));
    }

    if ((await this.checkAuth(projectId, "project", "edit")) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, "没有权限"));
    }

    const saved = await swaggerSyncService.saveOrUpdate(requestBody);
    if (!saved.ok) {
      return (ctx.body = yapi.commons.resReturn(null, saved.code, saved.message));
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
    return (ctx.body = yapi.commons.resReturn(saved.data));
  }

  /**
   * 查询定时任务
   */
  async getSync(ctx) {
    let projectId = ctx.query.project_id;
    const result = await swaggerSyncService.getByProjectId(projectId);
    if (!result.ok) {
      return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
    }
    return (ctx.body = yapi.commons.resReturn(result.data));
  }
}

export default syncController;
