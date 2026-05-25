// @ts-nocheck
/**
 * Swagger 自动同步插件业务逻辑
 */
import yapi from "../runtime.js";
import { projectRepository } from "../repositories/index.js";
import { swaggerSyncRepository } from "../repositories/swaggerSync.repo.js";
import { getSyncModeName } from "./swaggerSync.util.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

export { getSyncModeName } from "./swaggerSync.util.js";

class SwaggerSyncService extends BaseService {
  constructor() {
    super();
    this.syncModel = swaggerSyncRepository;
    this.projectModel = projectRepository;
  }

  /** 保存或更新同步配置 */
  async saveOrUpdate(body) {
    if (!body.project_id) {
      return fail(408, "缺少项目Id");
    }
    let result;
    if (body.id) {
      result = await this.syncModel.up(body);
    } else {
      result = await this.syncModel.save(body);
    }
    return ok(result);
  }

  /** 按项目查询同步配置 */
  async getByProjectId(projectId) {
    if (!projectId) {
      return fail(408, "缺少项目Id");
    }
    const result = await this.syncModel.getByProjectId(projectId);
    return ok(result);
  }

  /** 记录自动同步日志 */
  saveSyncLog(errcode, syncMode, moremsg, uid, projectId) {
    yapi.commons.saveLog({
      content:
        "自动同步接口状态:" +
        (errcode == 0 ? "成功," : "失败,") +
        "合并模式:" +
        getSyncModeName(syncMode) +
        ",更多信息:" +
        moremsg,
      type: "project",
      uid,
      username: "自动同步用户",
      typeid: projectId,
    });
  }
}

export default new SwaggerSyncService();
