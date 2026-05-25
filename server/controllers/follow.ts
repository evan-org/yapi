// @ts-nocheck
/**
 * 关注项目 HTTP 控制器（薄层：参数 → Service → 响应）
 */
import yapi from "../runtime.js";
import baseController from "./base.js";
import { followService } from "../services/index.js";

class followController extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  /**
   * @interface /follow/list
   * @method GET
   */
  async list(ctx) {
    try {
      const result = await followService.listByUser(this.getUid());
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  /**
   * @interface /follow/del
   * @method POST
   */
  async del(ctx) {
    try {
      const { projectid } = ctx.request.body;
      const result = await followService.unfollow(this.getUid(), projectid);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * @interface /follow/add
   * @method POST
   */
  async add(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, { projectid: "number" });
      const result = await followService.follow(this.getUid(), params.projectid);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }
}

export default followController;
