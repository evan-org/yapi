// @ts-nocheck
/**
 * 接口模块：查询与列表
 */
import _ from "underscore";
import commons from "../../utils/commons.js";
import { ok, fail } from "../service-result.js";
import { applyStatusTagFilter } from "../interface.util.js";
import {
  validateCategoryId,
  validateInterfaceProjectId,
  validateCustomFieldQuery,
  validateInterfaceId,
} from "../interface.validation.js";
import { repos } from "./shared.js";

const {
  interfaceModel,
  catModel,
  groupModel,
  projectModel,
  userModel,
} = repos;

export async function getProjectBaseInfo(projectId) {
  const project = await projectModel.getBaseInfo(projectId);
  if (!project) {
    return fail(406, "不存在的项目");
  }
  return ok(project);
}

export async function listMenuByProject(projectId) {
  const categories = await catModel.list(projectId);
  const newResult = await Promise.all(
    categories.map(async (catRow) => {
      const item = catRow;
      const list = await interfaceModel.listByCatid(item._id);
      item.list = list.map((row) => row);
      return item;
    })
  );
  return ok(newResult);
}

export async function listCategories(projectId) {
  const res = await catModel.list(projectId);
  return ok(res);
}

export async function getById(id) {
  const result = await interfaceModel.get(id);
  if (!result) {
    return fail(490, "不存在的");
  }
  const data = result;
  const userinfo = await userModel.findById(result.uid);
  if (userinfo) {
    data.username = userinfo.username;
  }
  return ok(data);
}

export async function requireInterface(id, notFoundMsg = "不存在的接口") {
  const result = await interfaceModel.get(id);
  if (!result) {
    return fail(400, notFoundMsg);
  }
  return ok(result);
}

export async function requireCategory(catid, notFoundMsg = "分类不存在") {
  const cate = await catModel.get(catid);
  if (!cate) {
    return fail(400, notFoundMsg);
  }
  return ok(cate);
}

export function schemaToJson(schema, required) {
  return commons.schemaToJson(schema, {
    alwaysFakeOptionals: _.isUndefined(required) ? true : required,
  });
}

export async function queryByCustomField(queryParams) {
  const fieldValidated = validateCustomFieldQuery(queryParams);
  if (!fieldValidated.ok) {
    return fieldValidated;
  }
  const { fieldName: customFieldName, fieldValue: customFieldValue } =
    fieldValidated.data;

  const groups = await groupModel.getcustomFieldName(customFieldName);
  if (groups.length === 0) {
    return fail(404, "没有找到对应自定义接口");
  }

  const interfaces = [];
  for (let i = 0; i < groups.length; i++) {
    const projects = await projectModel.list(groups[i]._id);
    for (let j = 0; j < projects.length; j++) {
      let inter = await interfaceModel.getcustomFieldValue(
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

export async function listOpenByProject(projectId) {
  const project = await projectModel.getBaseInfo(projectId);
  if (!project) {
    return fail(406, "不存在的项目");
  }

  const basepath = project.basepath;
  const categories = await catModel.list(projectId);
  const chunks = await Promise.all(
    categories.map(async (catRow) => {
      const cat = catRow;
      const list = await interfaceModel.listByInterStatus(cat._id, "open");
      return list.map((row) => {
        const item = row;
        item.basepath = basepath;
        return item;
      });
    })
  );

  return ok({ project, list: chunks.flat() });
}

export async function listByProject({ project_id, page, limit, status, tag }) {
  const projectValidated = validateInterfaceProjectId(project_id);
  if (!projectValidated.ok) {
    return projectValidated;
  }
  project_id = projectValidated.data;
  const project = await projectModel.getBaseInfo(project_id);
  if (!project) {
    return fail(407, "不存在的项目");
  }

  let result;
  let count;
  if (limit === "all") {
    result = await interfaceModel.list(project_id);
    count = await interfaceModel.listCount({ project_id });
  } else {
    const option = applyStatusTagFilter({ project_id }, status, tag);
    result = await interfaceModel.listByOptionWithPage(option, page, limit);
    count = await interfaceModel.listCount(option);
  }

  return ok({
    count,
    total: Math.ceil(count / limit),
    list: result,
  });
}

export async function listByCategory({ catid, page, limit, status, tag }) {
  const catValidated = validateCategoryId(catid);
  if (!catValidated.ok) {
    return catValidated;
  }
  catid = catValidated.data;
  const catdata = await catModel.get(catid);
  if (!catdata) {
    return fail(400, "分类不存在");
  }
  const project = await projectModel.getBaseInfo(catdata.project_id);
  if (!project) {
    return fail(407, "不存在的项目");
  }

  const option = applyStatusTagFilter({ catid }, status, tag);
  const result = await interfaceModel.listByOptionWithPage(option, page, limit);
  const count = await interfaceModel.listCount(option);
  return ok({
    count,
    total: Math.ceil(count / limit),
    list: result,
    project,
  });
}

export async function checkEditConflict(id, uid) {
  const idValidated = validateInterfaceId(id);
  if (!idValidated.ok) {
    return idValidated;
  }
  id = idValidated.data;
  const result = await interfaceModel.get(id);
  if (!result) {
    return fail(400, "接口不存在");
  }
  if (result.edit_uid !== 0 && result.edit_uid !== uid) {
    const userinfo = await userModel.findById(result.edit_uid);
    return ok({
      errno: result.edit_uid,
      data: { uid: result.edit_uid, username: userinfo.username },
    });
  }
  interfaceModel.upEditUid(id, uid).then();
  return ok({
    errno: 0,
    data: result,
  });
}

export function releaseEditLock(id) {
  interfaceModel.upEditUid(id, 0).then();
}
