/**
 * 关注项目 HTTP 控制器（薄层：参数 → Service → 响应）
 */
import type { AppContext } from "../types/app-context.js";
import commons from "../utils/commons.js";
import baseController from "./base.js";
import { followService } from "../services/index.js";
import { replyServiceResult, replyException } from "./controller.util.js";

class followController extends baseController {
  constructor(ctx: AppContext) {
    super(ctx);
  }

  /**
   * @interface /follow/list
   * @method GET
   */
  async list(ctx: AppContext) {
    try {
      const result = await followService.listByUser(this.getUid());
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * @interface /follow/del
   * @method POST
   */
  async del(ctx: AppContext) {
    try {
      const body = ctx.request.body as { projectid?: number };
      const result = await followService.unfollow(this.getUid(), body.projectid);
      replyServiceResult(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * @interface /follow/add
   * @method POST
   */
  async add(ctx: AppContext) {
    try {
      const params = commons.handleParams(ctx.request.body, { projectid: "number" }) as {
        projectid: number;
      };
      const result = await followService.follow(this.getUid(), params.projectid);
      replyServiceResult(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }
}

export default followController;
