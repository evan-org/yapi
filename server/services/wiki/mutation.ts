// @ts-nocheck
/**
 * Wiki 模块：保存
 */
import { nowSeconds } from "../../shared/clock.js";
import notificationService from "../notification.service.js";
import { ok, fail } from "../service-result.js";
import { repos, type WikiSaveParams, type WikiSaveContext } from "./shared.js";
import { sendWikiNotice } from "./notify.js";

const { wikiModel } = repos;

export async function save(params: WikiSaveParams, ctx: WikiSaveContext) {
  if (!params.project_id) {
    return fail(400, "项目id不能为空");
  }

  const notice = params.email_notice;
  const { username, uid, wikiUrl } = ctx;
  const saveParams = { ...params };
  delete saveParams.email_notice;

  const existing = await wikiModel.get(params.project_id);
  let result;

  if (!existing) {
    const data = {
      ...saveParams,
      username,
      uid,
      add_time: nowSeconds(),
      up_time: nowSeconds(),
    };
    result = await wikiModel.save(data);
  } else {
    const data = {
      ...saveParams,
      username,
      uid,
      up_time: nowSeconds(),
    };
    result = await wikiModel.up(existing._id, data);
  }

  const logData = {
    type: "wiki",
    project_id: params.project_id,
    current: params.desc,
    old: existing ? existing.desc : "",
  };

  if (notice) {
    await sendWikiNotice(params.project_id, username, wikiUrl, logData);
  }

  notificationService.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 更新了 <a href="${wikiUrl}">wiki</a> 的信息`,
    type: "project",
    uid,
    username,
    typeid: params.project_id,
    data: logData,
  });

  return ok(result);
}
