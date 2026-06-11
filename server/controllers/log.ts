/**
 * 动态日志 HTTP 控制器（薄层：参数 → Service → 响应）
 */
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import { logService } from "../services/index.js";
import { replyServiceResult, replyException } from "./controller.util.js";

/** action-runner 入参校验 schema（list_by_update） */
type LogSchemaMap = {
  listByUpdate: {
    "*type": string;
    "*typeid": string;
    apis: Array<{ method: string; path: string }>;
  };
};

class logController extends baseController {
  declare schemaMap: LogSchemaMap;

  constructor(ctx: AppContext) {
    super(ctx);
    this.schemaMap = {
      listByUpdate: {
        "*type": "string",
        "*typeid": "number",
        apis: [
          {
            method: "string",
            path: "string",
          },
        ],
      },
    };
  }

  /**
   * @interface /log/list
   * @method GET
   */
  async list(ctx: AppContext) {
    try {
      const query = ctx.request.query as {
        typeid?: string;
        type?: string;
        page?: string;
        limit?: string;
        selectValue?: string;
      };
      const result = await logService.listPaged({
        typeid: query.typeid,
        type: query.type,
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        selectValue: query.selectValue,
      });
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * @interface /log/list_by_update
   * @method POST
   */
  async listByUpdate(ctx: AppContext) {
    try {
      const params = ctx.params as unknown as {
        typeid: number;
        type: string;
        apis: Array<{ method: string; path: string }>;
      };
      const result = await logService.listByInterfaceUpdates(params);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }
}

export default logController;
