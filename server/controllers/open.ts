// @ts-nocheck
import yapi from '../runtime.js';

import baseController from './base.js';

import {
  projectRepository,
  interfaceColRepository,
  interfaceCaseRepository,
  interfaceRepository,
  interfaceCatRepository,
  followRepository,
  userRepository,
} from '../repositories/index.js';

import renderToHtml from '../utils/reportHtml.js';

import { openService } from "../services/index.js";

import HanldeImportData from '../common/HandleImportData.js';

/**
 * {
 *    postman: require('./m')
 * }
 */
const importDataModule = {};
yapi.emitHook("import_data", importDataModule);

class openController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.projectModel = projectRepository;
    this.interfaceColModel = interfaceColRepository;
    this.interfaceCaseModel = interfaceCaseRepository;
    this.interfaceModel = interfaceRepository;
    this.interfaceCatModel = interfaceCatRepository;
    this.followModel = followRepository;
    this.userModel = userRepository;
    this.schemaMap = {
      runAutoTest: {
        "*id": "number",
        project_id: "string",
        token: "string",
        mode: {
          type: "string",
          default: "html"
        },
        email: {
          type: "boolean",
          default: false
        },
        download: {
          type: "boolean",
          default: false
        },
        closeRemoveAdditional: true
      },
      importData: {
        "*type": "string",
        url: "string",
        "*token": "string",
        json: "string",
        project_id: "string",
        merge: {
          type: "string",
          default: "normal"
        }
      }
    };
  }

  async importData(ctx) {
    let type = ctx.params.type;
    let content = ctx.params.json;
    let project_id = ctx.params.project_id;
    let dataSync = ctx.params.merge;

    let warnMessage = ""

    /**
     * 因为以前接口文档写错了，做下兼容
     */
    try {
      if (!dataSync && ctx.params.dataSync) {
        warnMessage = "importData Api 已废弃 dataSync 传参，请联系管理员将 dataSync 改为 merge."
        dataSync = ctx.params.dataSync
      }
    } catch (e) {}

    let token = ctx.params.token;
    if (!type || !importDataModule[type]) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "不存在的导入方式"));
    }

    if (!content && !ctx.params.url) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "json 或者 url 参数，不能都为空"));
    }
    const resolved = await openService.resolveImportJson({
      json: content,
      url: ctx.params.url,
    });
    if (!resolved.ok) {
      return (ctx.body = yapi.commons.resReturn(null, resolved.code, resolved.message));
    }
    content = resolved.data.parsed;
    if (resolved.data.warnMessage) {
      warnMessage = resolved.data.warnMessage;
    }

    const { menuList, selectCatid } = await openService.ensureDefaultCat(
      project_id,
      this.getUid()
    );
    let projectData = await this.projectModel.get(project_id);
    let res = await importDataModule[type](content);

    let successMessage;
    let errorMessage = [];
    await HanldeImportData(
      res,
      project_id,
      selectCatid,
      menuList,
      projectData.basePath,
      dataSync,
      (err) => {
        errorMessage.push(err);
      },
      (msg) => {
        successMessage = msg;
      },
      () => {},
      token,
      yapi.WEBCONFIG.port
    );

    if (errorMessage.length > 0) {
      return (ctx.body = yapi.commons.resReturn(null, 404, errorMessage.join("\n")));
    }
    ctx.body = yapi.commons.resReturn(null, 0, successMessage + warnMessage);
  }

  /**
   * 开放接口：导出项目接口 JSON（需 token）
   * GET /api/open/project_interface_data?token=&project_id=
   */
  async projectInterfaceData(ctx) {
    if (!this.$tokenAuth) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "token 验证失败"));
    }

    const projectId = ctx.params.project_id || ctx.query.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "project_id 不能为空"));
    }

    try {
      const result = await openService.exportProjectInterfaces(projectId);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.set("Content-Type", "application/json; charset=utf-8");
      ctx.body = JSON.stringify(result.data, null, 2);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  async runAutoTest(ctx) {
    if (!this.$tokenAuth) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "token 验证失败"));
    }

    const token = ctx.query.token;
    const projectId = ctx.params.project_id;
    const id = ctx.params.id;

    const result = await openService.runAutoTest({
      colId: id,
      projectId,
      params: ctx.params,
      uid: this.getUid(),
    });

    if (!result.ok) {
      if (result.data && result.data.errcode !== undefined) {
        return (ctx.body = result.data);
      }
      return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
    }

    const { reportsResult, projectId: pid, colId, params } = result.data;

    if (params.email === true && reportsResult.message.failedNum !== 0) {
      let autoTestUrl = `${ctx.request.origin}/api/open/run_auto_test?id=${colId}&token=${token}&mode=${params.mode}`;
      yapi.commons.sendNotice(pid, {
        title: "YApi自动化测试报告",
        content: `
        <html>
        <head>
        <title>测试报告</title>
        <meta charset="utf-8" />
        <body>
        <div>
        <h3>测试结果：</h3>
        <p>${reportsResult.message.msg}</p>
        <h3>测试结果详情如下：</h3>
        <p>${autoTestUrl}</p>
        </div>
        </body>
        </html>`
      });
    }

    let mode = params.mode || "html";
    if (params.download === true) {
      ctx.set("Content-Disposition", `attachment; filename=test.${mode}`);
    }
    if (params.mode === "json") {
      return (ctx.body = reportsResult);
    }
    return (ctx.body = renderToHtml(reportsResult));
  }
}

export default openController;
