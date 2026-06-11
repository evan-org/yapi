// @ts-nocheck
/**
 * 接口数据导出（薄层：调 Service 写附件响应）
 */
import baseController from "./base.js";
import commons from "../utils/commons.js";
import { exportDataService } from "../services/index.js";
import { replyServiceResult } from "./controller.util.js";

class exportDataController extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  async exportData(ctx) {
    const { pid, type, status, isWiki } = ctx.request.query;

    try {
      const result = await exportDataService.exportProjectDownload({
        projectId: pid,
        status,
        type,
        isWiki,
        themeVariant: "default",
      });
      if (!result.ok) {
        return replyServiceResult(ctx, result);
      }
      ctx.set("Content-Type", result.data.contentType);
      ctx.set("Content-Disposition", result.data.disposition);
      ctx.body = result.data.body;
    } catch (error) {
      commons.log(error, "error");
      ctx.body = commons.resReturn(null, 502, "下载出错");
    }
  }
}

export default exportDataController;
