const yapi = require("@server/yapi.js");
//
const baseController = require("@server/controllers/BaseController.js");
//
const syncModel = require("./lib/syncModel.js");
const ProjectModel = require("@server/models/ProjectModel.js");
const interfaceSyncUtils = require("./lib/interfaceSyncUtils.js");

class controller extends baseController {
  constructor(ctx) {
    super(ctx);
    this.syncModel = yapi.getInst(syncModel);
    this.ProjectModel = yapi.getInst(ProjectModel);
    this.interfaceSyncUtils = yapi.getInst(interfaceSyncUtils);
  }

  /**
   * 保存定时任务
   * @param {*} ctx
   */
  async upSync(ctx) {
    let requestBody = ctx.request.body;
    let projectId = requestBody.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, "缺少项目Id"));
    }

    if ((await this.checkAuth(projectId, "project", "edit")) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, "没有权限"));
    }

    let result;
    if (requestBody.id) {
      result = await this.syncModel.up(requestBody);
    } else {
      result = await this.syncModel.save(requestBody);
    }

    // 操作定时任务
    if (requestBody.is_sync_open) {
      this.interfaceSyncUtils.addSyncJob(projectId, requestBody.sync_cron, requestBody.sync_json_url, requestBody.sync_mode, requestBody.uid);
    } else {
      this.interfaceSyncUtils.deleteSyncJob(projectId);
    }
    return (ctx.body = yapi.commons.resReturn(result));
  }

  /**
   * 查询定时任务
   * @param {*} ctx
   */
  async getSync(ctx) {
    let projectId = ctx.query.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, "缺少项目Id"));
    }
    let result = await this.syncModel.getByProjectId(projectId);
    return (ctx.body = yapi.commons.resReturn(result));
  }

}


module.exports = controller;
