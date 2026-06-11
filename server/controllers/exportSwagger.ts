// @ts-nocheck
/**
 * Swagger 导出（薄层：调 Service 写附件响应）
 */
import baseController from "./base.js";
import yapi from "../runtime.js";
import { exportDataService } from "../services/index.js";
import { replyServiceResult } from "./controller.util.js";

class exportSwaggerController extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  async exportData(ctx) {
    const pid = ctx.request.query.pid;
    const type = ctx.request.query.type;
    const status = ctx.request.query.status;

    if (!pid) {
      ctx.body = yapi.commons.resReturn(null, 200, "pid 不为空");
      return;
    }

    try {
      const result = await exportDataService.exportSwaggerV2(pid, status, type);
      if (!result.ok) {
        return replyServiceResult(ctx, result);
      }
      ctx.set("Content-Type", "application/octet-stream");
      ctx.set("Content-Disposition", "attachment; filename=swaggerApi.json");
      ctx.body = result.data;
    } catch (error) {
      yapi.commons.log(error, "error");
      ctx.body = yapi.commons.resReturn(null, 502, "下载出错");
    }
  }
}

export default exportSwaggerController;
