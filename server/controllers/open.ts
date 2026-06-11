/**
 * 开放 API HTTP 控制器（token 鉴权 → openService）
 */
import type { AppContext } from "../types/app-context.js";
import commons from "../utils/commons.js";
import baseController from "./base.js";
import renderToHtml from "../utils/reportHtml/index.js";
import { openService, notificationService } from "../services/index.js";

type OpenSchemaMap = {
  runAutoTest: Record<string, unknown>;
  importData: Record<string, unknown>;
};

class openController extends baseController {
  declare schemaMap: OpenSchemaMap;

  constructor(ctx: AppContext) {
    super(ctx);
    this.schemaMap = {
      runAutoTest: {
        "*id": "number",
        project_id: "string",
        token: "string",
        mode: {
          type: "string",
          default: "html",
        },
        email: {
          type: "boolean",
          default: false,
        },
        download: {
          type: "boolean",
          default: false,
        },
        closeRemoveAdditional: true,
      },
      importData: {
        "*type": "string",
        url: "string",
        "*token": "string",
        json: "string",
        project_id: "string",
        merge: {
          type: "string",
          default: "normal",
        },
      },
    };
  }

  async importData(ctx: AppContext) {
    const params = ctx.params as unknown as Record<string, unknown>;
    const result = await openService.importData({
      type: params.type,
      json: params.json,
      url: params.url,
      project_id: params.project_id,
      merge: params.merge,
      dataSync: params.dataSync,
      uid: this.getUid(),
      token: params.token,
    });
    if (result.ok === false) {
      ctx.body = commons.resReturn(null, result.code, result.message);
      return;
    }
    const payload = result.data as { message?: string };
    ctx.body = commons.resReturn(null, 0, payload.message);
  }

  /**
   * 开放接口：导出项目接口 JSON（需 token）
   * GET /api/open/project_interface_data?token=&project_id=
   */
  async projectInterfaceData(ctx: AppContext) {
    if (!this.$tokenAuth) {
      ctx.body = commons.resReturn(null, 40022, "token 验证失败");
      return;
    }

    const params = ctx.params as unknown as Record<string, unknown>;
    const projectId = params.project_id || ctx.query.project_id;
    if (!projectId) {
      ctx.body = commons.resReturn(null, 400, "project_id 不能为空");
      return;
    }

    try {
      const result = await openService.exportProjectInterfaces(
        projectId as string | number
      );
      if (result.ok === false) {
        ctx.body = commons.resReturn(null, result.code, result.message);
        return;
      }
      ctx.set("Content-Type", "application/json; charset=utf-8");
      ctx.body = JSON.stringify(result.data, null, 2);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      ctx.body = commons.resReturn(null, 402, message);
    }
  }

  async runAutoTest(ctx: AppContext) {
    if (!this.$tokenAuth) {
      ctx.body = commons.resReturn(null, 40022, "token 验证失败");
      return;
    }

    const token = ctx.query.token;
    const params = ctx.params as unknown as Record<string, string | boolean | undefined>;
    const projectId = params.project_id as string | number;
    const id = params.id as string | number;

    const result = await openService.runAutoTest({
      colId: id,
      projectId,
      params: params as Record<string, string | undefined>,
      uid: this.getUid(),
    });

    if (result.ok === false) {
      const failData = result.data as { errcode?: number } | undefined;
      if (failData && failData.errcode !== undefined) {
        ctx.body = result.data;
        return;
      }
      ctx.body = commons.resReturn(null, result.code, result.message);
      return;
    }

    const { reportsResult, projectId: pid, colId, params: runParams } = result.data;
    const tokenStr = Array.isArray(token) ? token[0] : token;
    const runOpts = runParams as Record<string, unknown>;

    if (runOpts.email === true || runOpts.email === "true") {
      const failedNum = (reportsResult as { message?: { failedNum?: number } }).message
        ?.failedNum;
      if (failedNum !== 0) {
        const origin = new URL(ctx.request.url).origin;
        const autoTestUrl = `${origin}/api/open/run_auto_test?id=${colId}&token=${tokenStr}&mode=${runOpts.mode}`;
        notificationService.sendNotice(pid, {
          title: "YApi自动化测试报告",
          content: `
        <html>
        <head>
        <title>测试报告</title>
        <meta charset="utf-8" />
        <body>
        <div>
        <h3>测试结果：</h3>
        <p>${(reportsResult as { message?: { msg?: string } }).message?.msg}</p>
        <h3>测试结果详情如下：</h3>
        <p>${autoTestUrl}</p>
        </div>
        </body>
        </html>`,
        });
      }
    }

    const mode = String(runOpts.mode || "html");
    if (runOpts.download === true || runOpts.download === "true") {
      ctx.set("Content-Disposition", `attachment; filename=test.${mode}`);
    }
    if (runOpts.mode === "json") {
      ctx.body = reportsResult;
      return;
    }
    ctx.body = renderToHtml(reportsResult);
  }
}

export default openController;
