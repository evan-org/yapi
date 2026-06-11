/**
 * Swagger 自动同步业务逻辑
 */
import commons from "../utils/commons.js";
import { projectRepository } from "../repositories/index.js";
import { swaggerSyncRepository } from "../repositories/swaggerSync.repo.js";
import { getSyncModeName } from "./swaggerSync.util.js";
import { validateSwaggerSyncProjectId } from "./swaggerSync.validation.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

export { getSyncModeName } from "./swaggerSync.util.js";

class SwaggerSyncService extends BaseService {
  syncModel = swaggerSyncRepository;
  projectModel = projectRepository;

  /** 保存或更新同步配置 */
  async saveOrUpdate(body: Record<string, unknown>) {
    const validated = validateSwaggerSyncProjectId(
      body.project_id as number | string | null | undefined
    );
    if (!validated.ok) {
      return validated;
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
  async getByProjectId(projectId: number | string | null | undefined) {
    const validated = validateSwaggerSyncProjectId(projectId);
    if (!validated.ok) {
      return validated;
    }
    const result = await this.syncModel.getByProjectId(validated.data);
    return ok(result);
  }

  /** 记录自动同步日志 */
  saveSyncLog(
    errcode: number,
    syncMode: string,
    moremsg: string,
    uid: number | string,
    projectId: number | string
  ) {
    commons.saveLog({
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
