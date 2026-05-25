/**
 * 接口模块业务逻辑（查询、增删改、自定义字段、开放列表、Schema 转换等）
 */
import _ from "underscore";
import fs from "fs-extra";
import path from "path";
import jsondiffpatch from "jsondiffpatch";
import showDiffMsg from "../common/diff-view.js";
import yapi from "../runtime.js";
import type { YapiRuntime } from "../types/global.js";
import commons from "../utils/commons.js";
import {
  interfaceRepository,
  interfaceCatRepository,
  interfaceCaseRepository,
  groupRepository,
  projectRepository,
  userRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";
import {
  handleHeaders,
  buildQueryPathFromUrl,
  applyStatusTagFilter,
  mergeSaveResBody,
} from "./interface.util.js";
import {
  validateAddCategoryParams,
  validateCategoryId,
  validateInterfaceProjectId,
  validateCustomFieldQuery,
  validateIndexBatchItems,
  validateBatchUploadInput,
  validateInterfaceId,
} from "./interface.validation.js";

export {
  handleHeaders,
  buildQueryPathFromUrl,
  applyStatusTagFilter,
  mergeSaveResBody,
} from "./interface.util.js";

const formattersHtml = jsondiffpatch.formatters.html;

/** plugin 启动后挂载 emitHook */
function emitInterfaceHook(name: string, ...args: unknown[]) {
  const hook = (yapi as YapiRuntime).emitHook;
  if (hook) {
    hook(name, ...args).then();
  }
}

type InterfaceOperator = {
  uid: number | string;
  username: string;
  role?: string;
};

type InterfaceSchemaMap = {
  add: Record<string, unknown>;
  up: Record<string, unknown>;
};

type InterfaceSaveOptions = {
  schemas?: InterfaceSchemaMap;
  requestOrigin?: string;
};

class InterfaceService extends BaseService {
  interfaceModel = interfaceRepository;
  catModel = interfaceCatRepository;
  caseModel = interfaceCaseRepository;
  groupModel = groupRepository;
  projectModel = projectRepository;
  userModel = userRepository;

  /**
   * 项目基础信息（侧栏/列表鉴权）
   */
  async getProjectBaseInfo(projectId) {
    const project = await this.projectModel.getBaseInfo(projectId);
    if (!project) {
      return fail(406, "不存在的项目");
    }
    return ok(project);
  }

  /**
   * 侧栏菜单：分类 + 接口列表（并行加载）
   */
  async listMenuByProject(projectId) {
    const categories = await this.catModel.list(projectId);
    const newResult = await Promise.all(
      categories.map(async (catRow) => {
        const item = catRow;
        let list = await this.interfaceModel.listByCatid(item._id);
        item.list = list.map((row) => row);
        return item;
      })
    );
    return ok(newResult);
  }

  /**
   * 分类菜单列表
   */
  async listCategories(projectId) {
    const res = await this.catModel.list(projectId);
    return ok(res);
  }

  /**
   * 更新接口分类
   */
  async updateCategory({ catid, name, desc, uid, username }) {
    const cate = await this.catModel.get(catid);
    if (!cate) {
      return fail(400, "分类不存在");
    }
    const result = await this.catModel.up(catid, {
      name,
      desc,
      up_time: commons.time(),
    });
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 更新了分类 <a href="/project/${cate.project_id}/interface/api/cat_${catid}">${cate.name}</a>`,
      type: "project",
      uid,
      username,
      typeid: cate.project_id,
    });
    return ok({ result, project_id: cate.project_id });
  }

  /**
   * 接口详情（不含权限；controller 负责鉴权与 username）
   */
  async getById(id) {
    const result = await this.interfaceModel.get(id);
    if (!result) {
      return fail(490, "不存在的");
    }
    const data = result;
    const userinfo = await this.userModel.findById(result.uid);
    if (userinfo) {
      data.username = userinfo.username;
    }
    return ok(data);
  }

  /**
   * JSON Schema 转 mock JSON
   */
  schemaToJson(schema, required) {
    return commons.schemaToJson(schema, {
      alwaysFakeOptionals: _.isUndefined(required) ? true : required,
    });
  }

  /**
   * 自定义字段查询
   */
  async queryByCustomField(queryParams) {
    const fieldValidated = validateCustomFieldQuery(queryParams);
    if (!fieldValidated.ok) {
      return fieldValidated;
    }
    const { fieldName: customFieldName, fieldValue: customFieldValue } =
      fieldValidated.data;

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
            const row = item;
            row.res_body = commons.json_parse(row.res_body);
            row.req_body_other = commons.json_parse(row.req_body_other);
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
        const cat = catRow;
        let list = await this.interfaceModel.listByInterStatus(cat._id, "open");
        return list.map((row) => {
          const item = row;
          item.basepath = basepath;
          return item;
        });
      })
    );

    return ok({ project, list: chunks.flat() });
  }

  /**
   * 删除接口及关联用例
   */
  async deleteInterface(id, { uid, username }) {
    const data = await this.interfaceModel.get(id);
    if (!data) {
      return fail(400, "接口不存在");
    }
    const result = await this.interfaceModel.del(id);
    emitInterfaceHook("interface_del", id);
    await this.caseModel.delByInterfaceId(id);
    const cate = await this.catModel.get(data.catid);
    if (cate) {
      commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 删除了分类 <a href="/project/${cate.project_id}/interface/api/cat_${data.catid}">${cate.name}</a> 下的接口 "${data.title}"`,
        type: "project",
        uid,
        username,
        typeid: cate.project_id,
      });
    }
    await this.projectModel.up(data.project_id, {
      up_time: new Date().getTime(),
    });
    return ok({ result, data });
  }

  /**
   * 删除分类及下属接口
   */
  async deleteCategory(catId, { uid, username }) {
    const catData = await this.catModel.get(catId);
    if (!catData) {
      return fail(400, "不存在的分类");
    }
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 删除了分类 "${catData.name}" 及该分类下的接口`,
      type: "project",
      uid,
      username,
      typeid: catData.project_id,
    });
    const interfaceData = await this.interfaceModel.listByCatid(catId);
    for (const item of interfaceData) {
      try {
        emitInterfaceHook("interface_del", item._id);
        await this.caseModel.delByInterfaceId(item._id);
      } catch (e) {
        commons.log(e.message, "error");
      }
    }
    await this.catModel.del(catId);
    const r = await this.interfaceModel.delByCatid(catId);
    return ok(r);
  }

  /**
   * 新增接口分类
   */
  async addCategory(params) {
    const validated = validateAddCategoryParams(params);
    if (!validated.ok) {
      return validated;
    }
    const { name, project_id, desc, uid, username } = validated.data;
    const result = await this.catModel.save({
      name,
      project_id,
      desc,
      uid,
      add_time: commons.time(),
      up_time: commons.time(),
    });
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 添加了分类  <a href="/project/${project_id}/interface/api/cat_${result._id}">${name}</a>`,
      type: "project",
      uid,
      username,
      typeid: project_id,
    });
    return ok(result);
  }

  /**
   * 项目接口分页列表
   */
  async listByProject({ project_id, page, limit, status, tag }) {
    const projectValidated = validateInterfaceProjectId(project_id);
    if (!projectValidated.ok) {
      return projectValidated;
    }
    project_id = projectValidated.data;
    const project = await this.projectModel.getBaseInfo(project_id);
    if (!project) {
      return fail(407, "不存在的项目");
    }

    let result;
    let count;
    if (limit === "all") {
      result = await this.interfaceModel.list(project_id);
      count = await this.interfaceModel.listCount({ project_id });
    } else {
      const option = applyStatusTagFilter({ project_id }, status, tag);
      result = await this.interfaceModel.listByOptionWithPage(option, page, limit);
      count = await this.interfaceModel.listCount(option);
    }

    emitInterfaceHook("interface_list", result);
    return ok({
      count,
      total: Math.ceil(count / limit),
      list: result,
    });
  }

  /**
   * 分类下接口分页列表
   */
  async listByCategory({ catid, page, limit, status, tag }) {
    const catValidated = validateCategoryId(catid);
    if (!catValidated.ok) {
      return catValidated;
    }
    catid = catValidated.data;
    const catdata = await this.catModel.get(catid);
    if (!catdata) {
      return fail(400, "分类不存在");
    }
    const project = await this.projectModel.getBaseInfo(catdata.project_id);
    if (!project) {
      return fail(407, "不存在的项目");
    }

    const option = applyStatusTagFilter({ catid }, status, tag);
    const result = await this.interfaceModel.listByOptionWithPage(option, page, limit);
    const count = await this.interfaceModel.listCount(option);
    return ok({
      count,
      total: Math.ceil(count / limit),
      list: result,
      project,
    });
  }

  /**
   * 批量更新接口排序 index
   */
  updateIndexBatch(items) {
    const validated = validateIndexBatchItems(items);
    if (!validated.ok) {
      return validated;
    }
    validated.data.forEach((item) => {
      if (item.id) {
        this.interfaceModel.upIndex(item.id, item.index).then(
          () => {},
          (err) => {
            commons.log(err.message, "error");
          }
        );
      }
    });
    return ok("成功！");
  }

  /**
   * 批量更新分类排序 index
   */
  updateCatIndexBatch(items) {
    const validated = validateIndexBatchItems(items);
    if (!validated.ok) {
      return validated;
    }
    validated.data.forEach((item) => {
      if (item.id) {
        this.catModel.upCatIndex(item.id, item.index).then(
          () => {},
          (err) => {
            commons.log(err.message, "error");
          }
        );
      }
    });
    return ok("成功！");
  }

  /**
   * 将接口文档中的 tag 同步到项目 tag 列表
   */
  async autoAddTag(params) {
    const tags = params.tag;
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return;
    }
    const projectData = await this.projectModel.get(params.project_id);
    let tagsInProject = projectData.tag;
    let needUpdate = false;
    if (tagsInProject && Array.isArray(tagsInProject) && tagsInProject.length > 0) {
      tags.forEach((tag) => {
        if (!_.find(tagsInProject, (item) => item.name === tag)) {
          needUpdate = true;
          tagsInProject.push({
            name: tag,
            desc: tag,
          });
        }
      });
    } else {
      needUpdate = true;
      tagsInProject = [];
      tags.forEach((tag) => {
        tagsInProject.push({
          name: tag,
          desc: tag,
        });
      });
    }
    if (needUpdate) {
      await this.projectModel.up(params.project_id, {
        tag: tagsInProject,
        up_time: commons.time(),
      });
    }
  }

  /**
   * 按 path+method 保存接口：已存在则更新（可多条），不存在则新增
   * 不含权限校验；controller 负责鉴权
   */
  async saveInterface(
    params: Record<string, any>,
    { uid, username, role }: InterfaceOperator,
    options: InterfaceSaveOptions = {}
  ) {
    const { schemas, requestOrigin } = options;
    if (!schemas) {
      return fail(400, "缺少参数校验 schema");
    }
    const payload = Object.assign({}, params);
    payload.method = (payload.method || "GET").toUpperCase();

    const { http_path } = buildQueryPathFromUrl(payload.path);
    if (!commons.verifyPath(http_path.pathname)) {
      return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
    }

    const existing = await this.interfaceModel.getByPath(
      payload.project_id,
      payload.path,
      payload.method,
      "_id res_body"
    );

    if (existing.length > 0) {
      let lastData = null;
      for (const item of existing) {
        const validParams = Object.assign({}, payload, { id: item._id });
        const validResult = commons.validateParams(schemas.up, validParams);
        if (!validResult.valid) {
          return fail(400, validResult.message);
        }
        if (payload.res_body !== undefined) {
          validParams.res_body = mergeSaveResBody(payload, item);
        }
        const iface = await this.interfaceModel.get(item._id);
        const upResult = await this.updateInterface(
          validParams,
          iface,
          { uid, username },
          { requestOrigin }
        );
        if (!upResult.ok) {
          return upResult;
        }
        lastData = upResult.data;
      }
      return ok(lastData);
    }

    const validResult = commons.validateParams(schemas.add, payload);
    if (!validResult.valid) {
      return fail(400, validResult.message);
    }
    return this.addInterface(payload, { uid, username, role });
  }

  /**
   * 新增接口（不含权限校验；controller 负责鉴权）
   */
  async addInterface(params, { uid, username, role }) {
    params.method = params.method || "GET";
    params.res_body_is_json_schema = _.isUndefined(params.res_body_is_json_schema)
      ? false
      : params.res_body_is_json_schema;
    params.req_body_is_json_schema = _.isUndefined(params.req_body_is_json_schema)
      ? false
      : params.req_body_is_json_schema;
    params.method = params.method.toUpperCase();
    params.req_params = params.req_params || [];
    params.res_body_type = params.res_body_type ? params.res_body_type.toLowerCase() : "json";

    const { http_path, query_path } = buildQueryPathFromUrl(params.path);
    if (!commons.verifyPath(http_path.pathname)) {
      return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
    }

    handleHeaders(params);
    params.query_path = query_path;

    const checkRepeat = await this.interfaceModel.checkRepeat(
      params.project_id,
      params.path,
      params.method
    );
    if (checkRepeat > 0) {
      return fail(40022, "已存在的接口:" + params.path + "[" + params.method + "]");
    }

    const data = Object.assign(params, {
      uid,
      add_time: commons.time(),
      up_time: commons.time(),
    });

    commons.handleVarPath(params.path, params.req_params);

    if (params.req_params.length > 0) {
      data.type = "var";
      data.req_params = params.req_params;
    } else {
      data.type = "static";
    }

    if (role !== "admin" && uid !== 999999) {
      const userdata = await commons.getUserdata(uid, "dev");
      const check = await this.projectModel.checkMemberRepeat(params.project_id, uid);
      if (check === 0 && userdata) {
        await this.projectModel.addMember(params.project_id, [userdata]);
      }
    }

    const result = await this.interfaceModel.save(data);
    emitInterfaceHook("interface_add", result);
    this.catModel.get(params.catid).then((cate) => {
      const title = `<a href="/user/profile/${uid}">${username}</a> 为分类 <a href="/project/${params.project_id}/interface/api/cat_${params.catid}">${cate.name}</a> 添加了接口 <a href="/project/${params.project_id}/interface/api/${result._id}">${data.title}</a> `;
      commons.saveLog({
        content: title,
        type: "project",
        uid,
        username,
        typeid: params.project_id,
      });
      this.projectModel.up(params.project_id, { up_time: new Date().getTime() }).then();
    });

    await this.autoAddTag(params);
    return ok(result);
  }

  /**
   * diff 邮件 HTML 片段
   */
  diffNoticeHtml(html) {
    if (html.length === 0) {
      return '<span style="color: #555">没有改动，该操作未改动Api数据</span>';
    }
    return html
      .map(
        (item) => `<div>
      <h4 class="title">${item.title}</h4>
      <div>${item.content}</div>
    </div>`
      )
      .join("");
  }

  /**
   * 更新接口（不含权限校验；interfaceData 为更新前文档）
   */
  async updateInterface(
    params: Record<string, any>,
    interfaceData: Record<string, any>,
    { uid, username }: InterfaceOperator,
    options: { requestOrigin?: string } = {}
  ) {
    const requestOrigin = options.requestOrigin || "";

    if (!_.isUndefined(params.method)) {
      params.method = String(params.method || "GET").toUpperCase();
    }

    const id = params.id;
    params.message = String(params.message || "").replace(/\n/g, "<br>");

    handleHeaders(params);

    const data = Object.assign(
      {
        up_time: commons.time(),
      },
      params
    );

    if (params.path) {
      const { http_path, query_path } = buildQueryPathFromUrl(String(params.path));
      if (!commons.verifyPath(http_path.pathname)) {
        return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
      }
      data.query_path = query_path;
    }

    if (
      params.path &&
      (params.path !== interfaceData.path || params.method !== interfaceData.method)
    ) {
      const checkRepeat = await this.interfaceModel.checkRepeat(
        interfaceData.project_id,
        params.path,
        params.method
      );
      if (checkRepeat > 0) {
        return fail(401, "已存在的接口:" + params.path + "[" + params.method + "]");
      }
    }

    if (!_.isUndefined(data.req_params)) {
      if (Array.isArray(data.req_params) && data.req_params.length > 0) {
        data.type = "var";
      } else {
        data.type = "static";
        data.req_params = [];
      }
    }

    const result = await this.interfaceModel.up(id, data);
    const CurrentInterfaceData = await this.interfaceModel.get(id);
    const toObj = (doc) =>
      doc;
    const logData = {
      interface_id: id,
      cat_id: data.catid,
      current: toObj(CurrentInterfaceData),
      old: toObj(interfaceData),
    };

    this.catModel.get(interfaceData.catid).then((cate) => {
      const diffView2 = showDiffMsg(jsondiffpatch, formattersHtml, logData);
      if (diffView2.length <= 0) {
        return;
      }
      commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 
                    更新了分类 <a href="/project/${cate.project_id}/interface/api/cat_${
          data.catid
        }">${cate.name}</a> 
                    下的接口 <a href="/project/${cate.project_id}/interface/api/${id}">${
          interfaceData.title
        }</a><p>${params.message}</p>`,
        type: "project",
        uid,
        username,
        typeid: cate.project_id,
        data: logData,
      });
    });

    this.projectModel.up(interfaceData.project_id, { up_time: new Date().getTime() }).then();

    if (params.switch_notice === true) {
      const diffView = showDiffMsg(jsondiffpatch, formattersHtml, logData);
      const annotatedCss = fs.readFileSync(
        path.resolve(
          yapi.WEBROOT,
          "node_modules/jsondiffpatch/dist/formatters-styles/annotated.css"
        ),
        "utf8"
      );
      const htmlCss = fs.readFileSync(
        path.resolve(yapi.WEBROOT, "node_modules/jsondiffpatch/dist/formatters-styles/html.css"),
        "utf8"
      );

      const project = await this.projectModel.getBaseInfo(interfaceData.project_id);
      const interfaceUrl = `${requestOrigin}/project/${interfaceData.project_id}/interface/api/${id}`;

      (commons as unknown as { sendNotice: (pid: unknown, data: unknown) => void }).sendNotice(
        interfaceData.project_id,
        {
          title: `${username} 更新了接口`,
        content: `<html>
        <head>
        <style>
        ${annotatedCss}
        ${htmlCss}
        </style>
        </head>
        <body>
        <div><h3>${username}更新了接口(${data.title})</h3>
        <p>项目名：${project.name} </p>
        <p>修改用户: ${username}</p>
        <p>接口名: <a href="${interfaceUrl}">${data.title}</a></p>
        <p>接口路径: [${data.method}]${data.path}</p>
        <p>详细改动日志: ${this.diffNoticeHtml(diffView)}</p></div>
        </body>
        </html>`,
        }
      );
    }

    emitInterfaceHook("interface_update", id);
    await this.autoAddTag(params);
    return ok(result);
  }

  /**
   * 从批量上传 payload 解析接口列表
   */
  parseUploadApis(raw) {
    let apis = [];
    if (Array.isArray(raw)) {
      if (raw[0] && raw[0].list) {
        raw.forEach((c) => {
          apis = apis.concat(c.list || []);
        });
      } else {
        apis = raw;
      }
    } else if (raw && raw.list) {
      raw.list.forEach((c) => {
        apis = apis.concat(c.list || []);
      });
    } else {
      return fail(400, "data 格式有误");
    }
    return ok(apis);
  }

  /**
   * Chrome 插件 / 批量上传接口 JSON
   */
  async batchUploadInterfaces({ project_id, catid, raw }, { uid, username, role }) {
    const inputValidated = validateBatchUploadInput({ project_id, raw });
    if (!inputValidated.ok) {
      return inputValidated;
    }
    project_id = inputValidated.data.project_id;
    raw = inputValidated.data.raw;

    let parsed = raw;
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    const apisResult = this.parseUploadApis(parsed);
    if (!apisResult.ok) {
      return apisResult;
    }
    const apis = apisResult.data;

    let resolvedCatid = catid;
    if (!resolvedCatid) {
      const cats = await this.catModel.list(project_id);
      if (!cats.length) {
        return fail(400, "请先创建接口分类");
      }
      resolvedCatid = cats[0]._id;
    }

    let success = 0;
    const errors = [];
    for (const api of apis) {
      const item = Object.assign({}, api, {
        project_id: Number(project_id),
        catid: api.catid || resolvedCatid,
      });
      delete item._id;
      delete item.__v;

      const addResult = await this.addInterface(item, { uid, username, role });
      if (addResult.ok === false) {
        errors.push(
          addResult.message || `${item.title || item.path}: 导入失败`
        );
      } else {
        success++;
      }
    }

    return ok({
      success,
      failed: errors.length,
      errors: errors.slice(0, 20),
    });
  }

  /**
   * 接口编辑冲突检测（WebSocket）
   */
  async checkEditConflict(id, uid) {
    const idValidated = validateInterfaceId(id);
    if (!idValidated.ok) {
      return idValidated;
    }
    id = idValidated.data;
    const result = await this.interfaceModel.get(id);
    if (!result) {
      return fail(400, "接口不存在");
    }
    if (result.edit_uid !== 0 && result.edit_uid !== uid) {
      const userinfo = await this.userModel.findById(result.edit_uid);
      return ok({
        errno: result.edit_uid,
        data: { uid: result.edit_uid, username: userinfo.username },
      });
    }
    this.interfaceModel.upEditUid(id, uid).then();
    return ok({
      errno: 0,
      data: result,
    });
  }

  /**
   * 释放接口编辑锁
   */
  releaseEditLock(id) {
    this.interfaceModel.upEditUid(id, 0).then();
  }
}

export default new InterfaceService();
