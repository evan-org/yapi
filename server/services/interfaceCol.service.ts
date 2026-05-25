// @ts-nocheck
/**
 * 测试集合（interfaceCol / interfaceCase）业务逻辑
 */
import yapi from "../runtime.js";
import {
  interfaceColRepository,
  interfaceCaseRepository,
  interfaceRepository,
  projectRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class InterfaceColService extends BaseService {
  constructor() {
    super();
    this.colModel = interfaceColRepository;
    this.caseModel = interfaceCaseRepository;
    this.interfaceModel = interfaceRepository;
    this.projectModel = projectRepository;
  }

  /**
   * 获取项目基础信息（列表页鉴权用）
   */
  async getProjectBaseInfo(projectId) {
    const project = await this.projectModel.getBaseInfo(projectId);
    if (!project) {
      return fail(407, "不存在的项目");
    }
    return ok(project);
  }

  /**
   * 测试集合列表（含用例与接口 path）
   */
  async listWithCases(projectId) {
    let result = await this.colModel.list(projectId);
    result = result.sort((a, b) => a.index - b.index);

    result = await Promise.all(
      result.map(async (colRow) => {
        const col = colRow.toObject();
        let caseList = await this.caseModel.list(col._id);
        const interfaceIds = [
          ...new Set(caseList.map((c) => c.interface_id).filter(Boolean)),
        ];
        const pathByInterfaceId = {};
        await Promise.all(
          interfaceIds.map(async (interfaceId) => {
            const iface = await this.interfaceModel.getBaseinfo(interfaceId);
            if (iface) {
              pathByInterfaceId[interfaceId] = iface.path;
            }
          })
        );
        caseList = caseList
          .map((c) => {
            const item = c.toObject();
            item.path = pathByInterfaceId[item.interface_id];
            return item;
          })
          .sort((a, b) => a.index - b.index);
        col.caseList = caseList;
        return col;
      })
    );
    return ok(result);
  }

  /**
   * 新增测试集合
   */
  async addCol({ name, project_id, desc, uid, username }) {
    if (!project_id) {
      return fail(400, "项目id不能为空");
    }
    if (!name) {
      return fail(400, "名称不能为空");
    }
    const result = await this.colModel.save({
      name,
      project_id,
      desc,
      uid,
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time(),
    });
    yapi.commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 添加了接口集 <a href="/project/${project_id}/interface/col/${result._id}">${name}</a>`,
      type: "project",
      uid,
      username,
      typeid: project_id,
    });
    return ok(result);
  }

  /**
   * 删除测试集合及下属用例
   */
  async deleteCol(colId, { uid, username }) {
    const colData = await this.colModel.get(colId);
    if (!colData) {
      return fail(400, "不存在的id");
    }
    const result = await this.colModel.del(colId);
    await this.caseModel.delByCol(colId);
    yapi.commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 删除了接口集 ${colData.name} 及其下面的接口`,
      type: "project",
      uid,
      username,
      typeid: colData.project_id,
    });
    return ok({ result, colData });
  }

  /**
   * 删除单个测试用例
   */
  async deleteCase(caseId, { uid, username }) {
    const caseData = await this.caseModel.get(caseId);
    if (!caseData) {
      return fail(400, "不存在的caseid");
    }
    const result = await this.caseModel.del(caseId);
    const col = await this.colModel.get(caseData.col_id);
    if (col) {
      yapi.commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 删除了接口集 <a href="/project/${caseData.project_id}/interface/col/${caseData.col_id}">${col.name}</a> 下的接口 ${caseData.casename}`,
        type: "project",
        uid,
        username,
        typeid: caseData.project_id,
      });
    }
    await this.projectModel.up(caseData.project_id, {
      up_time: new Date().getTime(),
    });
    return ok({ result, caseData });
  }
}

export default new InterfaceColService();
