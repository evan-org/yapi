/**
 * 接口导出共用逻辑（分类+接口列表、脱敏 id 等）
 */
import {
  interfaceRepository,
  interfaceCatRepository,
  projectRepository,
} from "../repositories/index.js";
import { wikiRepository } from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

export { stripExportIds } from "./exportData.util.js";

class ExportDataService extends BaseService {
  catModel = interfaceCatRepository;
  interfaceModel = interfaceRepository;
  projectModel = projectRepository;

  /**
   * 按状态聚合分类与接口列表（导出 markdown/json/swagger 共用）
   */
  async listCategoriesWithApis(projectId: number | string, status: string) {
    const result = await this.catModel.list(projectId);
    const newResult = [];
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      let list = await this.interfaceModel.listByInterStatus(item._id, status);
      list = list.sort((a, b) => a.index - b.index);
      if (list.length > 0) {
        item.list = list;
        newResult.push(item);
      }
    }
    return newResult;
  }

  /** 项目详情 */
  async getProject(projectId: number | string) {
    const project = await this.projectModel.get(projectId);
    if (!project) {
      return fail(404, "项目不存在");
    }
    return ok(project);
  }

  /** Wiki 文档（可选） */
  async getWiki(projectId: number | string) {
    return wikiRepository.get(projectId);
  }
}

export default new ExportDataService();
