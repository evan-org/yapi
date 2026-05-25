// @ts-nocheck
import _ from 'underscore';

import baseController from './base.js';

import yapi from '../runtime.js';
import { clientPublicFile } from "../utils/client-public.js";

import {
  interfaceRepository,
  interfaceCatRepository,
  interfaceCaseRepository,
  followRepository,
  groupRepository,
  userRepository,
  projectRepository,
} from '../repositories/index.js';

import { interfaceService } from '../services/index.js';
import { interfaceSchemaMap } from '../validators/interface.schemas.js';

class interfaceController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.Model = interfaceRepository;
    this.catModel = interfaceCatRepository;
    this.projectModel = projectRepository;
    this.caseModel = interfaceCaseRepository;
    this.followModel = followRepository;
    this.userModel = userRepository;
    this.groupModel = groupRepository;
    this.schemaMap = interfaceSchemaMap;
  }

  /**
   * 添加项目分组
   * @interface /interface/add
   * @method POST
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {String}   title 接口标题，不能为空
   * @param {String}   path 接口请求路径，不能为空
   * @param {String}   method 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Array} [req_params] name, desc两个参数
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   * @example ./api/interface/add.json
   */
  async add(ctx) {
    let params = ctx.params;

    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(params.project_id, "project", "edit");

      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 40033, "没有权限"));
      }
    }

    const result = await interfaceService.addInterface(params, {
      uid: this.getUid(),
      username: this.getUsername(),
      role: this.getRole(),
    });
    if (!result.ok) {
      return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
    }
    ctx.body = yapi.commons.resReturn(result.data);
  }

  /**
   * 保存接口数据，如果接口存在则更新数据，如果接口不存在则添加数据
   * @interface /interface/save
   * @method  post
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {String}   title 接口标题，不能为空
   * @param {String}   path 接口请求路径，不能为空
   * @param {String}   method 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Array} [req_params] name, desc两个参数
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   */
  async save(ctx) {
    const params = ctx.params;

    if (!this.$tokenAuth) {
      const auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 40033, "没有权限"));
      }
    }

    const result = await interfaceService.saveInterface(
      params,
      {
        uid: this.getUid(),
        username: this.getUsername(),
        role: this.getRole(),
      },
      {
        schemas: this.schemaMap,
        requestOrigin: ctx.request.origin,
      }
    );
    if (!result.ok) {
      return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
    }
    ctx.body = yapi.commons.resReturn(result.data);
  }

  /**
   * 获取项目分组
   * @interface /interface/get
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @returns {Object}
   * @example ./api/interface/get.json
   */
  async get(ctx) {
    let params = ctx.params;
    if (!params.id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "接口id不能为空"));
    }

    try {
      const loaded = await interfaceService.getById(params.id);
      if (!loaded.ok) {
        return (ctx.body = yapi.commons.resReturn(null, loaded.code, loaded.message));
      }
      if (this.$tokenAuth && params.project_id !== loaded.data.project_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "token有误"));
      }
      const project = await this.projectModel.getBaseInfo(loaded.data.project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      yapi.emitHook("interface_get", loaded.data).then();
      ctx.body = yapi.commons.resReturn(loaded.data);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 接口列表
   * @interface /interface/list
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {Number}   page 当前页
   * @param {Number}   limit 每一页限制条数
   * @returns {Object}
   * @example ./api/interface/list.json
   */
  async list(ctx) {
    let project_id = ctx.params.project_id;
    let page = ctx.request.query.page || 1,
      limit = ctx.request.query.limit || 10;
    let status = ctx.request.query.status,
      tag = ctx.request.query.tag;

    const proj = await interfaceService.getProjectBaseInfo(project_id);
    if (!proj.ok) {
      return (ctx.body = yapi.commons.resReturn(null, proj.code, proj.message));
    }
    if (proj.data.project_type === "private") {
      if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
      }
    }

    try {
      const result = await interfaceService.listByProject({
        project_id,
        page,
        limit,
        status,
        tag,
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  async downloadCrx(ctx) {
    let filename = "crossRequest.zip";
    let dataBuffer = yapi.fs.readFileSync(
      clientPublicFile("attachment", "cross-request.zip")
    );
    ctx.set("Content-disposition", "attachment; filename=" + filename);
    ctx.set("Content-Type", "application/zip");
    ctx.body = dataBuffer;
  }

  async listByCat(ctx) {
    let catid = ctx.request.query.catid;
    let page = ctx.request.query.page || 1,
      limit = ctx.request.query.limit || 10;
    let status = ctx.request.query.status,
      tag = ctx.request.query.tag;

    try {
      const result = await interfaceService.listByCategory({
        catid,
        page,
        limit,
        status,
        tag,
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      if (result.data.project.project_type === "private") {
        if ((await this.checkAuth(result.data.project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      ctx.body = yapi.commons.resReturn({
        count: result.data.count,
        total: result.data.total,
        list: result.data.list,
      });
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message + "1");
    }
  }

  async listByMenu(ctx) {
    let project_id = ctx.params.project_id;
    if (!project_id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    const proj = await interfaceService.getProjectBaseInfo(project_id);
    if (!proj.ok) {
      return (ctx.body = yapi.commons.resReturn(null, proj.code, proj.message));
    }
    if (proj.data.project_type === "private") {
      if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
      }
    }

    try {
      const result = await interfaceService.listMenuByProject(project_id);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  /**
   * 编辑接口
   * @interface /interface/up
   * @method POST
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @param {String}   [path] 接口请求路径
   * @param {String}   [method] 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   * @example ./api/interface/up.json
   */
  async up(ctx) {
    let params = ctx.params;

    let id = params.id;
    let interfaceData = await this.Model.get(id);
    if (!interfaceData) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的接口"));
    }
    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(interfaceData.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }
    }

    const result = await interfaceService.updateInterface(
      params,
      interfaceData,
      { uid: this.getUid(), username: this.getUsername() },
      { requestOrigin: ctx.request.origin }
    );
    if (!result.ok) {
      return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
    }
    ctx.body = yapi.commons.resReturn(result.data);
    return 1;
  }

  /**
   * 删除接口
   * @interface /interface/del
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @returns {Object}
   * @example ./api/interface/del.json
   */

  async del(ctx) {
    try {
      let id = ctx.request.body.id;

      if (!id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "接口id不能为空"));
      }

      let data = await this.Model.get(id);
      if (!data) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "接口不存在"));
      }

      if (data.uid != this.getUid()) {
        let auth = await this.checkAuth(data.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      const result = await interfaceService.deleteInterface(id, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data.result);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }
  // 处理编辑冲突
  async solveConflict(ctx) {
    try {
      let id = parseInt(ctx.query.id, 10);
      if (!id) {
        return ctx.websocket.send("id 参数有误");
      }
      const result = await interfaceService.checkEditConflict(id, this.getUid());
      if (!result.ok) {
        return ctx.websocket.send(result.message || "id 参数有误");
      }
      ctx.websocket.send(JSON.stringify(result.data));
      ctx.websocket.on("close", () => {
        interfaceService.releaseEditLock(id);
      });
    } catch (err) {
      yapi.commons.log(err, "error");
    }
  }

  async addCat(ctx) {
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
      if (!this.$tokenAuth) {
        let auth = await this.checkAuth(params.project_id, "project", "edit");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      if (!params.name) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "名称不能为空"));
      }

      const result = await interfaceService.addCategory({
        name: params.name,
        project_id: params.project_id,
        desc: params.desc,
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  async upCat(ctx) {
    try {
      let params = ctx.request.body;
      let cate = await this.catModel.get(params.catid);
      if (!cate) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "分类不存在"));
      }

      let auth = await this.checkAuth(cate.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceService.updateCategory({
        catid: params.catid,
        name: params.name,
        desc: params.desc,
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data.result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  async delCat(ctx) {
    try {
      let id = ctx.request.body.catid;
      let catData = await this.catModel.get(id);
      if (!catData) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的分类"));
      }

      if (catData.uid !== this.getUid()) {
        let auth = await this.checkAuth(catData.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      const result = await interfaceService.deleteCategory(id, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = yapi.commons.resReturn(result.data));
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 400, e.message));
    }
  }

  /**
   * 获取分类列表
   * @interface /interface/getCatMenu
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @returns {Object}
   * @example ./api/interface/getCatMenu
   */
  async getCatMenu(ctx) {
    let project_id = ctx.params.project_id;

    if (!project_id || isNaN(project_id)) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    try {
      const project = await this.projectModel.getBaseInfo(project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "edit")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      const res = await interfaceService.listCategories(project_id);
      if (!res.ok) {
        return (ctx.body = yapi.commons.resReturn(null, res.code, res.message));
      }
      return (ctx.body = yapi.commons.resReturn(res.data));
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 400, e.message));
    }
  }

  /**
   * 获取自定义接口字段数据
   * @interface /interface/get_custom_field
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {String}   app_code = '111'
   * @returns {Object}
   *
   */
  async getCustomField(ctx) {
    try {
      const result = await interfaceService.queryByCustomField(ctx.request.query);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = yapi.commons.resReturn(result.data));
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 400, e.message));
    }
  }

  requiredSort(params) {
    return params.sort((item1, item2) => item2.required - item1.required);
  }

  /**
   * 更新多个接口case index
   * @interface /interface/up_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */
  async upIndex(ctx) {
    try {
      const result = interfaceService.updateIndexBatch(ctx.request.body);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = yapi.commons.resReturn(result.data));
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 更新多个接口cat index
   * @interface /interface/up_cat_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */
  async upCatIndex(ctx) {
    try {
      const result = interfaceService.updateCatIndexBatch(ctx.request.body);
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      return (ctx.body = yapi.commons.resReturn(result.data));
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  async schema2json(ctx) {
    const schema = ctx.request.body.schema;
    const required = ctx.request.body.required;
    return (ctx.body = interfaceService.schemaToJson(schema, required));
  }

  /**
   * Chrome 插件 / 批量上传接口 JSON
   * POST /api/interface/interUpload  body: { project_id, catid?, data }
   */
  async interUpload(ctx) {
    try {
      const params = ctx.request.body || {};
      const project_id = params.project_id;

      if (!project_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "project_id 不能为空"));
      }

      const auth = await this.checkAuth(project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 40033, "没有权限"));
      }

      const result = await interfaceService.batchUploadInterfaces(
        {
          project_id,
          catid: params.catid,
          raw: params.data || params.json,
        },
        {
          uid: this.getUid(),
          username: this.getUsername(),
          role: this.getRole(),
        }
      );
      if (!result.ok) {
        return (ctx.body = yapi.commons.resReturn(null, result.code, result.message));
      }
      ctx.body = yapi.commons.resReturn(result.data);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  // 获取开放接口数据
  async listByOpen(ctx) {
    let project_id = ctx.request.query.project_id;

    if (!project_id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    try {
      const loaded = await interfaceService.listOpenByProject(project_id);
      if (!loaded.ok) {
        return (ctx.body = yapi.commons.resReturn(null, loaded.code, loaded.message));
      }
      const project = loaded.data.project;
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      ctx.body = yapi.commons.resReturn(loaded.data.list);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }
}

export default interfaceController;
