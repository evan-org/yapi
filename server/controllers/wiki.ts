// @ts-nocheck
/**
 * 项目 Wiki HTTP 控制器（薄层：鉴权 → Service → 响应）
 */
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import yapi from "../runtime.js";
import { wikiService } from "../services/index.js";
import { replyServiceResult, replyException } from "./controller.util.js";

class wikiController extends baseController {
  /**
   * 获取wiki信息
   * @interface wiki_desc/get
   */
  async get(ctx: AppContext) {
    try {
      const project_id = ctx.request.query.project_id;
      const result = await wikiService.getByProjectId(project_id);
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 保存wiki信息
   * @interface wiki_desc/save
   */
  async save(ctx: AppContext) {
    try {
      let params = ctx.request.body as Record<string, unknown>;
      params = yapi.commons.handleParams(params, {
        project_id: "number",
        desc: "string",
        markdown: "string",
      });

      if (!params.project_id) {
        ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空");
        return;
      }
      if (!this.$tokenAuth) {
        const auth = await this.checkAuth(
          params.project_id as number,
          "project",
          "edit"
        );
        if (!auth) {
          ctx.body = yapi.commons.resReturn(null, 400, "没有权限");
          return;
        }
      }

      const wikiUrl = `${ctx.request.origin}/project/${params.project_id}/wiki`;
      const result = await wikiService.save(
        {
          project_id: params.project_id as number,
          desc: params.desc as string | undefined,
          markdown: params.markdown as string | undefined,
          email_notice: params.email_notice as boolean | undefined,
        },
        {
          username: this.getUsername(),
          uid: this.getUid(),
          wikiUrl,
        }
      );
      replyServiceResult(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  // WebSocket 编辑冲突（协议层保留在 Controller）
  async wikiConflict(ctx: AppContext) {
    try {
      ctx.websocket.on("message", async (message: string) => {
        const id = parseInt(ctx.query.id as string, 10);
        if (!id) {
          ctx.websocket.send("id 参数有误");
          return;
        }
        const data = await this.websocketMsgMap(message, id);
        if (data) {
          ctx.websocket.send(JSON.stringify(data));
        }
      });
      ctx.websocket.on("close", async () => {});
    } catch (err) {
      yapi.commons.log(err, "error");
    }
  }

  async websocketMsgMap(msg: string, wikiId: number) {
    const map: Record<string, () => Promise<unknown>> = {
      start: () => wikiService.onWsStart(wikiId, this.getUid()),
      end: () => wikiService.onWsEnd(wikiId),
      editor: () => wikiService.onWsEditor(wikiId, this.getUid()),
    };
    const handler = map[msg];
    if (!handler) {
      return null;
    }
    const result = await handler();
    if (result && typeof result === "object" && "ok" in result && result.ok) {
      return result.data;
    }
    return null;
  }
}

export default wikiController;
