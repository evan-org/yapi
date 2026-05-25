// @ts-nocheck
/**
 * Service 基类：统一 Model 实例获取方式
 * 业务逻辑应放在 services/，controllers/ 仅做 HTTP 入参/出参适配
 */
import yapi from "../runtime.js";

export default class BaseService {
  /**
   * 获取 Mongoose Model 单例（与 runtime.getInst 一致）
   * @param {new (...args: unknown[]) => object} ModelClass
   */
  getModel(ModelClass) {
    return yapi.getInst(ModelClass);
  }
}
