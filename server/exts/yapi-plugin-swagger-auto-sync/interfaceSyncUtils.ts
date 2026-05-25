// @ts-nocheck
import schedule from "node-schedule";
import md5 from "md5";
import axios from "axios";
import yapi from "runtime.js";
import { projectRepository } from "../../repositories/index.js";
import { swaggerSyncRepository } from "../../repositories/swaggerSync.repo.js";
import openService from "../../services/open.service.js";
import projectService from "../../services/project.service.js";
import swaggerSyncService from "../../services/swaggerSync.service.js";

const jobMap = new Map();

class SyncUtils {
  constructor() {
    this.syncModel = swaggerSyncRepository;
    this.projectModel = projectRepository;
    this.init();
  }

  // 初始化定时任务
  async init() {
    if (process.env.YAPI_ENV === "test") {
      return;
    }
    let allSyncJob = await this.syncModel.listAll();
    for (let i = 0, len = allSyncJob.length; i < len; i++) {
      let syncItem = allSyncJob[i];
      if (syncItem.is_sync_open) {
        this.addSyncJob(
          syncItem.project_id,
          syncItem.sync_cron,
          syncItem.sync_json_url,
          syncItem.sync_mode,
          syncItem.uid
        );
      }
    }
  }

  /**
   * 新增同步任务
   */
  async addSyncJob(projectId, cronExpression, swaggerUrl, syncMode, uid) {
    if (!swaggerUrl) {
      return;
    }
    let projectToken = await this.getProjectToken(projectId, uid);
    this.syncInterface(projectId, swaggerUrl, syncMode, uid, projectToken);
    let scheduleItem = schedule.scheduleJob(cronExpression, async () => {
      this.syncInterface(projectId, swaggerUrl, syncMode, uid, projectToken);
    });

    let jobItem = jobMap.get(projectId);
    if (jobItem) {
      jobItem.cancel();
    }
    jobMap.set(projectId, scheduleItem);
  }

  // 同步接口
  async syncInterface(projectId, swaggerUrl, syncMode, uid, projectToken) {
    yapi.commons.log("定时器触发, syncJsonUrl:" + swaggerUrl + ",合并模式:" + syncMode);
    let oldPorjectData;
    try {
      oldPorjectData = await this.projectModel.get(projectId);
    } catch (e) {
      yapi.commons.log("获取项目:" + projectId + "失败");
      this.deleteSyncJob(projectId);
      await this.syncModel.delByProjectId(projectId);
      return;
    }
    if (!oldPorjectData) {
      yapi.commons.log("项目:" + projectId + "不存在");
      this.deleteSyncJob(projectId);
      await this.syncModel.delByProjectId(projectId);
      return;
    }
    let newSwaggerJsonData;
    try {
      newSwaggerJsonData = await this.getSwaggerContent(swaggerUrl);
      if (!newSwaggerJsonData || typeof newSwaggerJsonData !== "object") {
        yapi.commons.log("数据格式出错，请检查");
        swaggerSyncService.saveSyncLog(0, syncMode, "数据格式出错，请检查", uid, projectId);
      }
      newSwaggerJsonData = JSON.stringify(newSwaggerJsonData);
    } catch (e) {
      swaggerSyncService.saveSyncLog(0, syncMode, "获取数据失败，请检查", uid, projectId);
      yapi.commons.log("获取数据失败" + e.message);
    }

    let oldSyncJob = await this.syncModel.getByProjectId(projectId);

    if (
      newSwaggerJsonData &&
      oldSyncJob.old_swagger_content &&
      oldSyncJob.old_swagger_content == md5(newSwaggerJsonData)
    ) {
      oldSyncJob.last_sync_time = yapi.commons.time();
      await this.syncModel.upById(oldSyncJob._id, oldSyncJob);
      return;
    }

    const importResult = await openService.importData({
      type: "swagger",
      json: newSwaggerJsonData,
      project_id: projectId,
      merge: syncMode,
      uid: this.getUid(uid),
      token: projectToken,
    });

    const errcode = importResult.ok ? 0 : importResult.code;
    const errmsg = importResult.ok ? importResult.data.message : importResult.message;

    if (importResult.ok) {
      oldSyncJob.last_sync_time = yapi.commons.time();
      oldSyncJob.old_swagger_content = md5(newSwaggerJsonData);
      await this.syncModel.upById(oldSyncJob._id, oldSyncJob);
    }
    swaggerSyncService.saveSyncLog(errcode, syncMode, errmsg, uid, projectId);
  }

  getSyncJob(projectId) {
    return jobMap.get(projectId);
  }

  deleteSyncJob(projectId) {
    let jobItem = jobMap.get(projectId);
    if (jobItem) {
      jobItem.cancel();
    }
  }

  async getProjectToken(project_id, uid) {
    const result = await projectService.getOrCreateProjectToken(
      project_id,
      this.getUid(uid)
    );
    return result.ok ? result.data : "";
  }

  getUid(uid) {
    return parseInt(uid, 10);
  }

  async getSwaggerContent(swaggerUrl) {
    try {
      let response = await axios.get(swaggerUrl);
      if (response.status > 400) {
        throw new Error(
          `http status "${response.status}"` + "获取数据失败，请确认 swaggerUrl 是否正确"
        );
      }
      return response.data;
    } catch (e) {
      let response = e.response || { status: e.message || "error" };
      throw new Error(
        `http status "${response.status}"` + "获取数据失败，请确认 swaggerUrl 是否正确"
      );
    }
  }
}

export default new SyncUtils();
