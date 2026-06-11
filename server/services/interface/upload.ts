// @ts-nocheck
/**
 * 接口模块：批量上传与 Chrome 插件导入
 */
import { ok, fail } from "../service-result.js";
import { validateBatchUploadInput } from "../interface.validation.js";
import { repos } from "./shared.js";
import { addInterface } from "./mutation.js";

const { catModel } = repos;

export function parseUploadApis(raw) {
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

export async function batchUploadInterfaces(
  { project_id, catid, raw },
  { uid, username, role }
) {
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

  const apisResult = parseUploadApis(parsed);
  if (!apisResult.ok) {
    return apisResult;
  }
  const apis = apisResult.data;

  let resolvedCatid = catid;
  if (!resolvedCatid) {
    const cats = await catModel.list(project_id);
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

    const addResult = await addInterface(item, { uid, username, role });
    if (addResult.ok === false) {
      errors.push(addResult.message || `${item.title || item.path}: 导入失败`);
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
