// @ts-nocheck
/**
 * 统计与系统状态 HTTP 控制器（薄层）
 */
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import { statisticsService } from "../services/index.js";
import { replyServiceResult, replyException } from "./controller.util.js";

class statisticsController extends baseController {
  /**
   * 获取所有统计总数
   * @interface statismock/count
   */
  async getSummary(ctx: AppContext) {
    try {
      const result = await statisticsService.getSummary();
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 获取所有mock接口数据信息
   * @interface statismock/get
   */
  async getMockLog(ctx: AppContext) {
    try {
      const isAdmin = this.getRole() === "admin";
      const result = await statisticsService.getMockLog(isAdmin);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 获取系统状态信息
   * @interface statismock/getSystemStatus
   */
  async getSystem(ctx: AppContext) {
    try {
      const result = await statisticsService.getSystemStatus();
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 按分组统计
   */
  async getGroups(ctx: AppContext) {
    try {
      const result = await statisticsService.getGroupStats();
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }
}

export default statisticsController;
