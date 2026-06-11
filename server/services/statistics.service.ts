// @ts-nocheck
/**
 * 统计与系统状态业务逻辑
 */
import os from "node:os";
import cpu from "cpu-load";
import { getAppConfig, getMailTransport } from "../shared/config.js";
import {
  mockStatisticsRepository,
  groupRepository,
  projectRepository,
  interfaceRepository,
  interfaceCaseRepository,
} from "../repositories/index.js";
import * as statisticsUtil from "./statistics.util.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class StatisticsService extends BaseService {
  mockModel = mockStatisticsRepository;
  groupModel = groupRepository;
  projectModel = projectRepository;
  interfaceModel = interfaceRepository;
  interfaceCaseModel = interfaceCaseRepository;

  async getSummary() {
    const [groupCount, projectCount, interfaceCount, interfaceCaseCount] =
      await Promise.all([
        this.groupModel.getGroupListCount(),
        this.projectModel.getProjectListCount(),
        this.interfaceModel.getInterfaceListCount(),
        this.interfaceCaseModel.getInterfaceCaseListCount(),
      ]);
    return ok({ groupCount, projectCount, interfaceCount, interfaceCaseCount });
  }

  async getMockLog(isAdmin: boolean) {
    if (!isAdmin) {
      return fail(405, "没有权限");
    }
    const mockCount = await this.mockModel.getTotalCount();
    const dateInterval = statisticsUtil.getDateRange();
    const mockDateList = await this.mockModel.getDayCount(dateInterval);
    return ok({ mockCount, mockDateList });
  }

  async getSystemStatus() {
    let mail = "";
      const mailConfig = getAppConfig().mail as { enable?: boolean } | undefined;
      if (mailConfig && mailConfig.enable) {
        mail = await this.checkEmail();
    } else {
      mail = "未配置";
    }

    const load = (await this.cpuLoad()) * 100;
    return ok({
      mail,
      systemName: os.platform(),
      totalmem: statisticsUtil.transformBytesToGB(os.totalmem()),
      freemem: statisticsUtil.transformBytesToGB(os.freemem()),
      uptime: statisticsUtil.transformSecondsToDay(os.uptime()),
      load: load.toFixed(2),
    });
  }

  async getGroupStats() {
    const groupData = await this.groupModel.list();
    const result = [];

    for (const group of groupData) {
      const groupId = group._id;
      const data = {
        name: group.group_name,
        interface: 0,
        mock: 0,
        project: 0,
      };

      const projectCount = await this.projectModel.listCount(groupId);
      const projectData = await this.projectModel.list(groupId);
      let interfaceCount = 0;
      for (const project of projectData) {
        interfaceCount += await this.interfaceModel.listCount({
          project_id: project._id,
        });
      }
      const mockCount = await this.mockModel.countByGroupId(groupId);
      data.interface = interfaceCount;
      data.project = projectCount;
      data.mock = mockCount;
      result.push(data);
    }

    return ok(result);
  }

  private checkEmail(): Promise<string> {
    return new Promise((resolve) => {
      const transport = getMailTransport();
      if (!transport) {
        resolve("未配置");
        return;
      }
      transport.verify((error: Error | null) => {
        resolve(error ? "不可用" : "可用");
      });
    });
  }

  private cpuLoad(): Promise<number> {
    return new Promise((resolve) => {
      cpu(1000, (load: number) => resolve(load));
    });
  }
}

export default new StatisticsService();
