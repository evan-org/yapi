// @ts-nocheck
/**
 * 高级 Mock 期望管理 HTTP 控制器（薄层）
 */
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import yapi from "../runtime.js";
import { advancedMockApiService } from "../services/index.js";
import { replyServiceResult, replyException } from "./controller.util.js";

class advancedMockController extends baseController {
  async get(ctx: AppContext) {
    try {
      const id = ctx.request.query.interface_id;
      const result = await advancedMockApiService.getByInterfaceId(id);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async save(ctx: AppContext) {
    try {
      const params = ctx.request.body as {
        project_id?: number;
        interface_id?: number;
        mock_script?: string;
        enable?: boolean;
      };

      const auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        ctx.body = yapi.commons.resReturn(null, 40033, "没有权限");
        return;
      }

      const result = await advancedMockApiService.saveScript(
        {
          interface_id: params.interface_id!,
          project_id: params.project_id!,
          mock_script: params.mock_script,
          enable: params.enable,
        },
        this.getUid()
      );
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async listCases(ctx: AppContext) {
    try {
      const id = ctx.request.query.interface_id;
      const result = await advancedMockApiService.listCases(id);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async getCase(ctx: AppContext) {
    try {
      const id = ctx.request.query.id;
      const result = await advancedMockApiService.getCase(id);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async saveCase(ctx: AppContext) {
    try {
      const params = ctx.request.body;
      const result = await advancedMockApiService.saveCase(params, this.getUid());
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async deleteCase(ctx: AppContext) {
    try {
      const id = ctx.request.body.id;
      const result = await advancedMockApiService.deleteCase(id);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async hideCase(ctx: AppContext) {
    try {
      const { id, enable } = ctx.request.body;
      const result = await advancedMockApiService.hideCase(id, enable);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }
}

export default advancedMockController;
