/**
 * Service 基类
 * 业务逻辑应放在 services/；数据访问优先使用 repositories，与 controllers 保持一致
 */
import yapi from "../runtime.js";
import type { LegacyModelInstance } from "../repositories/base.repo.js";

export default class BaseService {
  /**
   * 获取 Mongoose Model 单例（遗留插件等场景；新业务请用 repositories）
   */
  getModel<T extends LegacyModelInstance>(
    ModelClass: new (...args: unknown[]) => T
  ): T {
    return yapi.getInst(ModelClass);
  }
}
