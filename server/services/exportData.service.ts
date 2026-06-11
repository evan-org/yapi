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
import defaultTheme from "../assets/export/defaultTheme.js";
import genDefaultTheme from "../assets/export/gen-defaultTheme.js";
import { stripExportIds } from "./exportData.util.js";
import { buildSwaggerV2Model } from "./export/swagger-v2.js";
import { buildExportJsonBody } from "./export/json.js";
import {
  buildExportMarkdown,
  buildExportHtml,
  safeBuildExport,
} from "./export/render.js";

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

  /**
   * 导出 Swagger 2.0 JSON 字符串
   */
  async exportSwaggerV2(
    projectId: number | string,
    status: string,
    type: string
  ) {
    if (type !== "OpenAPIV2") {
      return fail(400, "type 无效参数");
    }
    const proj = await this.getProject(projectId);
    if (!proj.ok) {
      return proj;
    }
    const list = await this.listCategoriesWithApis(projectId, status);
    const model = buildSwaggerV2Model(proj.data, stripExportIds(list));
    return ok(JSON.stringify(model, null, 2));
  }

  /**
   * 导出项目接口文档（markdown / json / html）
   */
  async exportProjectDownload(options: {
    projectId: number | string;
    status: string;
    type: string;
    isWiki?: string | boolean;
    fullPath?: boolean;
    themeVariant?: "default" | "gen";
  }) {
    const {
      projectId,
      status,
      type,
      isWiki,
      fullPath = false,
      themeVariant = "default",
    } = options;

    if (!projectId) {
      return fail(200, "pid 不为空");
    }

    const proj = await this.getProject(projectId);
    if (!proj.ok) {
      return proj;
    }
    const curProject = proj.data;
    const loadWiki = isWiki === true || isWiki === "true";
    const wikiData = loadWiki ? await this.getWiki(projectId) : undefined;
    const list = await this.listCategoriesWithApis(projectId, status);
    const themeCss = themeVariant === "gen" ? genDefaultTheme : defaultTheme;

    switch (type) {
      case "markdown": {
        const built = safeBuildExport(() =>
          buildExportMarkdown(curProject, wikiData, list, false)
        );
        if (built.ok === false) {
          return fail(502, built.message);
        }
        return ok({
          contentType: "application/octet-stream",
          disposition: "attachment; filename=api.md",
          body: built.body,
        });
      }
      case "json": {
        return ok({
          contentType: "application/octet-stream",
          disposition: "attachment; filename=api.json",
          body: buildExportJsonBody(list, curProject, fullPath),
        });
      }
      default: {
        const built = safeBuildExport(() =>
          buildExportHtml(curProject, wikiData, list, themeCss)
        );
        if (built.ok === false) {
          return fail(502, built.message);
        }
        return ok({
          contentType: "application/octet-stream",
          disposition: "attachment; filename=api.html",
          body: built.body,
        });
      }
    }
  }
}

export default new ExportDataService();
