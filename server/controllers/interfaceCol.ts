/**
 * 接口测试集 HTTP 控制器（薄层：权限 → interfaceColService）
 */
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import commons from "../utils/commons.js";
import {
  interfaceColRepository,
  interfaceCaseRepository,
  interfaceRepository,
  projectRepository,
} from "../repositories/index.js";
import { interfaceColService } from "../services/index.js";
import type { ServiceResult } from "../services/service-result.js";
import { replyServiceResult, replyException } from "./controller.util.js";

type RouteParams = Record<string, unknown>;

function queryScalar(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function routeId(value: unknown): number | string {
  return value as number | string;
}

class interfaceColController extends baseController {
  colModel: typeof interfaceColRepository;
  caseModel: typeof interfaceCaseRepository;
  interfaceModel: typeof interfaceRepository;

  _reply(ctx: AppContext, result: ServiceResult<unknown>) {
    replyServiceResult(ctx, result);
  }

  constructor(ctx: AppContext) {
    super(ctx);
    this.colModel = interfaceColRepository;
    this.caseModel = interfaceCaseRepository;
    this.interfaceModel = interfaceRepository;
    this.projectModel = projectRepository;
  }

  /**
   * @
   * 获取所有接口集
   * @interface /col/list
   * @method GET
   * @category col
   * @foldnumber 10
   * @param {String} project_id email名称，不能为空
   * @returns {Object}
   * @example
   */
  async list(ctx: AppContext) {
    try {
      const id = queryScalar(ctx.query.project_id);
      const proj = await interfaceColService.getProjectBaseInfo(id);
      if (proj.ok === false) {
        return (ctx.body = commons.resReturn(null, proj.code, proj.message));
      }
      if (proj.data.project_type === "private") {
        if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }
      const result = await interfaceColService.listWithCases(id);
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
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

  async addCol(ctx: AppContext) {
    try {
      const params = commons.handleParams(ctx.request.body as RouteParams, {
        name: "string",
        project_id: "number",
        desc: "string"
      }) as RouteParams;

      if (!params.project_id) {
        return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
      }
      if (!params.name) {
        return (ctx.body = commons.resReturn(null, 400, "名称不能为空"));
      }

      let auth = await this.checkAuth(routeId(params.project_id), "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
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
      replyException(ctx, e);
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
  async getCaseList(ctx: AppContext) {
    try {
      let id = ctx.query.col_id;
      let colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = commons.resReturn(null, 400, "不存在的接口集"));
      }
      let project = await this.projectModel.getBaseInfo(colData.project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }

      const result = await interfaceColService.fetchCaseList(id);
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      ctx.body = result.data;
    } catch (e) {
      replyException(ctx, e);
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
  async getCaseEnvList(ctx: AppContext) {
    try {
      let id = ctx.query.col_id;
      const colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = commons.resReturn(null, 400, "不存在的接口集"));
      }
      let project = await this.projectModel.getBaseInfo(colData.project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }

      const result = await interfaceColService.getCaseEnvList(id);
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
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

  async getCaseListByVariableParams(ctx: AppContext) {
    try {
      const id = queryScalar(ctx.query.col_id);
      if (!id || id === "0") {
        return (ctx.body = commons.resReturn(null, 407, "col_id不能为空"));
      }

      const firstCaseList = await this.caseModel.list(id, "all");
      if (firstCaseList.length > 0) {
        let project = await this.projectModel.getBaseInfo(firstCaseList[0].project_id);
        if (project.project_type === "private") {
          if ((await this.checkAuth(project._id, "project", "view")) !== true) {
            return (ctx.body = commons.resReturn(null, 406, "没有权限"));
          }
        }
      }

      const result = await interfaceColService.getCaseListByVariableParams(id);
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
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

  async addCase(ctx: AppContext) {
    try {
      const params = commons.handleParams(ctx.request.body as RouteParams, {
        casename: "string",
        project_id: "number",
        col_id: "number",
        interface_id: "number",
        case_env: "string"
      }) as RouteParams;

      if (!params.project_id) {
        return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
      }
      if (!params.interface_id) {
        return (ctx.body = commons.resReturn(null, 400, "接口id不能为空"));
      }
      if (!params.col_id) {
        return (ctx.body = commons.resReturn(null, 400, "接口集id不能为空"));
      }
      if (!params.casename) {
        return (ctx.body = commons.resReturn(null, 400, "用例名称不能为空"));
      }

      let auth = await this.checkAuth(routeId(params.project_id), "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.addCase(params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  async addCaseList(ctx: AppContext) {
    try {
      const params = commons.handleParams(ctx.request.body as RouteParams, {
        project_id: "number",
        col_id: "number"
      }) as RouteParams;

      let auth = await this.checkAuth(routeId(params.project_id), "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
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
      replyException(ctx, e);
    }
  }

  async cloneCaseList(ctx: AppContext) {
    try {
      const params = commons.handleParams(ctx.request.body as RouteParams, {
        project_id: "number",
        col_id: "number",
        new_col_id: "number"
      }) as RouteParams;

      let auth = await this.checkAuth(routeId(params.project_id), "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.cloneCaseList({
        project_id: params.project_id,
        col_id: params.col_id,
        new_col_id: params.new_col_id,
      });
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
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

  async upCase(ctx: AppContext) {
    try {
      const params = commons.handleParams(ctx.request.body as RouteParams, {
        id: "number",
        casename: "string"
      }) as RouteParams;

      if (!params.id) {
        return (ctx.body = commons.resReturn(null, 400, "用例id不能为空"));
      }

      let caseData = await this.caseModel.get(params.id);
      if (!caseData) {
        return (ctx.body = commons.resReturn(null, 400, "不存在的caseid"));
      }
      let auth = await this.checkAuth(caseData.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceColService.updateCase(params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
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

  async getCase(ctx: AppContext) {
    try {
      let id = ctx.query.caseid;
      const result = await interfaceColService.getCaseDetail(id);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
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

  async upCol(ctx: AppContext) {
    try {
      const params = ctx.request.body as RouteParams;
      let id = params.col_id;
      if (!id) {
        return (ctx.body = commons.resReturn(null, 400, "缺少 col_id 参数"));
      }
      let colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = commons.resReturn(null, 400, "不存在"));
      }
      let auth = await this.checkAuth(colData.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
      }
      delete params.col_id;
      const result = await interfaceColService.updateCol(id, params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
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

  async upCaseIndex(ctx: AppContext) {
    try {
      const result = interfaceColService.updateCaseIndexBatch(ctx.request.body);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
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

  async upColIndex(ctx: AppContext) {
    try {
      const result = interfaceColService.updateColIndexBatch(ctx.request.body);
      this._reply(ctx, result);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
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

  async delCol(ctx: AppContext) {
    try {
      let id = ctx.query.col_id;
      let colData = await this.colModel.get(id);
      if (!colData) {
        return (ctx.body = commons.resReturn(null, 400, "不存在的id"));
      }
      if (colData.uid !== this.getUid()) {
        let auth = await this.checkAuth(colData.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = commons.resReturn(null, 400, "没有权限"));
        }
      }
      const result = await interfaceColService.deleteCol(id, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = commons.resReturn(result.data.result, 0, undefined));
    } catch (e) {
      return (ctx.body = commons.resReturn(null, 400, e.message));
    }
  }

  /**
   *
   * @param {*} ctx
   */

  async delCase(ctx: AppContext) {
    try {
      let caseid = ctx.query.caseid;
      let caseData = await this.caseModel.get(caseid);
      if (!caseData) {
        return (ctx.body = commons.resReturn(null, 400, "不存在的caseid"));
      }

      if (caseData.uid !== this.getUid()) {
        let auth = await this.checkAuth(caseData.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = commons.resReturn(null, 400, "没有权限"));
        }
      }

      const result = await interfaceColService.deleteCase(caseid, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = commons.resReturn(result.data.result, 0, undefined));
    } catch (e) {
      return (ctx.body = commons.resReturn(null, 400, e.message));
    }
  }

  async runCaseScript(ctx: AppContext) {
    const params = ctx.request.body as RouteParams;
    const result = await interfaceColService.runCaseScript(
      params,
      params.col_id,
      params.interface_id,
      this.getUid()
    );
    ctx.body = result.data;
  }
}

export default interfaceColController;
