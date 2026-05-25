// @ts-nocheck
/**
 * 动态日志 HTTP 控制器（薄层：参数 → Service → 响应）
 */
import yapi from "../runtime.js";
import baseController from "./base.js";
import { logService } from "../services/index.js";

class logController extends baseController {
  constructor(ctx) {
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
  async list(ctx) {
    try {
      const result = await logService.listPaged(ctx.request.query);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  /**
   * @interface /log/list_by_update
   * @method POST
   */
  async listByUpdate(ctx) {
    try {
      const result = await logService.listByInterfaceUpdates(ctx.params);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }
}

export default logController;
