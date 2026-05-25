// @ts-nocheck
/**
 * 接口模块业务逻辑（查询、自定义字段、开放列表、Schema 转换等）
 */
import _ from "underscore";
import yapi from "../runtime.js";
import {
  interfaceRepository,
  interfaceCatRepository,
  groupRepository,
  projectRepository,
  userRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class InterfaceService extends BaseService {
  constructor() {
    super();
    this.interfaceModel = interfaceRepository;
    this.catModel = interfaceCatRepository;
    this.groupModel = groupRepository;
    this.projectModel = projectRepository;
    this.userModel = userRepository;
  }

  /**
   * 接口详情（不含权限；controller 负责鉴权与 username）
   */
  async getById(id) {
    const result = await this.interfaceModel.get(id);
    if (!result) {
      return fail(490, "不存在的");
    }
    return ok(result.toObject());
  }

  /**
   * JSON Schema 转 mock JSON
   */
  schemaToJson(schema, required) {
    return yapi.commons.schemaToJson(schema, {
      alwaysFakeOptionals: _.isUndefined(required) ? true : required,
    });
  }

  /**
   * 自定义字段查询
   */
  async queryByCustomField(queryParams) {
    const keys = Object.keys(queryParams || {});
    if (keys.length !== 1) {
      return fail(400, "参数数量错误");
    }
    const customFieldName = keys[0];
    const customFieldValue = queryParams[customFieldName];

    const groups = await this.groupModel.getcustomFieldName(customFieldName);
    if (groups.length === 0) {
      return fail(404, "没有找到对应自定义接口");
    }

    const interfaces = [];
    for (let i = 0; i < groups.length; i++) {
      const projects = await this.projectModel.list(groups[i]._id);
      for (let j = 0; j < projects.length; j++) {
        let inter = await this.interfaceModel.getcustomFieldValue(
          projects[j]._id,
          customFieldValue
        );
        if (inter.length > 0) {
          inter = inter.map((item) => {
            const row = item.toObject();
            row.res_body = yapi.commons.json_parse(row.res_body);
            row.req_body_other = yapi.commons.json_parse(row.req_body_other);
            return row;
          });
          interfaces.push({
            project_name: projects[j].name,
            project_id: projects[j]._id,
            list: inter,
          });
        }
      }
    }
    return ok(interfaces);
  }

  /**
   * 开放状态接口列表（按分类聚合，并行查询）
   */
  async listOpenByProject(projectId) {
    const project = await this.projectModel.getBaseInfo(projectId);
    if (!project) {
      return fail(406, "不存在的项目");
    }

    const basepath = project.basepath;
    const categories = await this.catModel.list(projectId);
    const chunks = await Promise.all(
      categories.map(async (catRow) => {
        const cat = catRow.toObject();
        let list = await this.interfaceModel.listByInterStatus(cat._id, "open");
        return list.map((row) => {
          const item = row.toObject();
          item.basepath = basepath;
          return item;
        });
      })
    );

    return ok({ project, list: chunks.flat() });
  }
}

export default new InterfaceService();
