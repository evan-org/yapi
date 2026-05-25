// @ts-nocheck
import baseController from './base.js';

import yapi from '../runtime.js';

import _ from 'underscore';

import {
  interfaceColRepository,
  interfaceCaseRepository,
  interfaceRepository,
  projectRepository,
} from '../repositories/index.js';
import { interfaceColService } from '../services/index.js';

class interfaceColController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.colModel = interfaceColRepository;
    this.caseModel = interfaceCaseRepository;
    this.interfaceModel = interfaceRepository;
    this.projectModel = projectRepository;
  }

  _reply(ctx, result) {
    if (!result.ok) {
      return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
    }
    return (ctx.body = yapi.commons.resReturn(result.data));
  }

  /**
   * 获取所有接口集
   * @interface /col/list
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String} project_id email名称，不能为空
   * @returns {Object}
   * @example
   */
  async list(ctx) {
    try {
      let id = ctx.query.project_id;
      const proj = await interfaceColService.getProjectBaseInfo(id);
      if (!proj.ok) {
        return (ctx.body = yapi.commons.resReturn(null, proj.code, proj.message));
      }
      if (proj.data.project_type === "private") {
        if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      const result = await interfaceColService.listWithCases(id);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 增加接口集
   * @interface /col/add_col
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Number} project_id
   * @param {String} name
   * @param {String} desc
   * @returns {Object}
   * @example
   */

  async addCol(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        name: "string",
        project_id: "number",
        desc: "string"
      });

      if (!params.project_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
      }
      if (!params.name) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "名称不能为空"));
      }

      let auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.addCol({
        name: params.name,
        project_id: params.project_id,
        desc: params.desc,
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 获取一个接口集下的所有的测试用例
   * @interface /col/case_list
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String} col_id 接口集id
   * @returns {Object}
   * @example
   */
  async getCaseList(ctx) {
    try {
      let id = ctx.query.col_id;
      if (!id || id == 0) {
        return (ctx.body = yapi.commons.resReturn(null, 407, "col_id不能为空"));
      }

      let colData = await this.colModel.get(id);
      let project = await this.projectModel.getBaseInfo(colData.project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }

      ctx.body = await yapi.commons.getCaseList(id);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 获取一个接口集下的所有的测试用例的环境变量
   * @interface /col/case_env_list
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String} col_id 接口集id
   * @returns {Object}
   * @example
   */
  async getCaseEnvList(ctx) {
    try {
      let id = ctx.query.col_id;
      const colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的接口集"));
      }
      let project = await this.projectModel.getBaseInfo(colData.project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }

      const result = await interfaceColService.getCaseEnvList(id);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 获取一个接口集下的所有的测试用例
   * @interface /col/case_list_by_var_params
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String} col_id 接口集id
   * @returns {Object}
   * @example
   */

  async getCaseListByVariableParams(ctx) {
    try {
      let id = ctx.query.col_id;
      if (!id || id == 0) {
        return (ctx.body = yapi.commons.resReturn(null, 407, "col_id不能为空"));
      }

      const firstCaseList = await this.caseModel.list(id, "all");
      if (firstCaseList.length > 0) {
        let project = await this.projectModel.getBaseInfo(firstCaseList[0].project_id);
        if (project.project_type === "private") {
          if ((await this.checkAuth(project._id, "project", "view")) !== true) {
            return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
          }
        }
      }

      const result = await interfaceColService.getCaseListByVariableParams(id);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 增加一个测试用例
   * @interface /col/add_case
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {String} casename
   * @param {Number} col_id
   * @param {Number} project_id
   * @param {String} domain
   * @param {String} path
   * @param {String} method
   * @param {Object} req_query
   * @param {Object} req_headers
   * @param {String} req_body_type
   * @param {Array} req_body_form
   * @param {String} req_body_other
   * @returns {Object}
   * @example
   */

  async addCase(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        casename: "string",
        project_id: "number",
        col_id: "number",
        interface_id: "number",
        case_env: "string"
      });

      if (!params.project_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
      }
      if (!params.interface_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "接口id不能为空"));
      }
      if (!params.col_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "接口集id不能为空"));
      }
      if (!params.casename) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "用例名称不能为空"));
      }

      let auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.addCase(params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  async addCaseList(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        project_id: "number",
        col_id: "number"
      });

      let auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.addCaseList(
        {
          project_id: params.project_id,
          col_id: params.col_id,
          interface_list: params.interface_list,
        },
        { uid: this.getUid(), username: this.getUsername() }
      );
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  async cloneCaseList(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        project_id: "number",
        col_id: "number",
        new_col_id: "number"
      });

      let auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.cloneCaseList({
        project_id: params.project_id,
        col_id: params.col_id,
        new_col_id: params.new_col_id,
      });
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 更新一个测试用例
   * @interface /col/up_case
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {number} id
   * @param {String} casename
   * @param {String} domain
   * @param {String} path
   * @param {String} method
   * @param {Object} req_query
   * @param {Object} req_headers
   * @param {String} req_body_type
   * @param {Array} req_body_form
   * @param {String} req_body_other
   * @returns {Object}
   * @example
   */

  async upCase(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        id: "number",
        casename: "string"
      });

      if (!params.id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "用例id不能为空"));
      }

      let caseData = await this.caseModel.get(params.id);
      if (!caseData) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的caseid"));
      }
      let auth = await this.checkAuth(caseData.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.updateCase(params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 获取一个测试用例详情
   * @interface /col/case
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String} caseid
   * @returns {Object}
   * @example
   */

  async getCase(ctx) {
    try {
      let id = ctx.query.caseid;
      const result = await interfaceColService.getCaseDetail(id);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 更新一个接口集name或描述
   * @interface /col/up_col
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {String} name
   * @param {String} desc
   * @returns {Object}
   * @example
   */

  async upCol(ctx) {
    try {
      let params = ctx.request.body;
      let id = params.col_id;
      if (!id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "缺少 col_id 参数"));
      }
      let colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "不存在"));
      }
      let auth = await this.checkAuth(colData.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }
      delete params.col_id;
      const result = await interfaceColService.updateCol(id, params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 更新多个接口case index
   * @interface /col/up_case_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */

  async upCaseIndex(ctx) {
    try {
      const result = interfaceColService.updateCaseIndexBatch(ctx.request.body);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 更新多个测试集合 index
   * @interface /col/up_col_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */

  async upColIndex(ctx) {
    try {
      const result = interfaceColService.updateColIndexBatch(ctx.request.body);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 删除一个接口集
   * @interface /col/del_col
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String}
   * @returns {Object}
   * @example
   */

  async delCol(ctx) {
    try {
      let id = ctx.query.col_id;
      let colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的id"));
      }
      if (colData.uid !== this.getUid()) {
        let auth = await this.checkAuth(colData.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }
      const result = await interfaceColService.deleteCol(id, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = yapi.commons.resReturn(result.data.result));
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 400, e.message));
    }
  }

  /**
   *
   * @param {*} ctx
   */

  async delCase(ctx) {
    try {
      let caseid = ctx.query.caseid;
      let caseData = await this.caseModel.get(caseid);
      if (!caseData) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的caseid"));
      }

      if (caseData.uid !== this.getUid()) {
        let auth = await this.checkAuth(caseData.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      const result = await interfaceColService.deleteCase(caseid, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = yapi.commons.resReturn(result.data.result));
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 400, e.message));
    }
  }

  async runCaseScript(ctx) {
    let params = ctx.request.body;
    ctx.body = await yapi.commons.runCaseScript(params, params.col_id, params.interface_id, this.getUid());
  }
}

export default interfaceColController;
