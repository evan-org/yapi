// @ts-nocheck
/**
 * 项目模块：开放 API Token
 */
import sha from "sha.js";
import commons from "../../utils/commons.js";
import { getToken } from "../../utils/token.js";
import { ok, fail } from "../service-result.js";
import { repos, errorMessage } from "./shared.js";

const { tokenModel } = repos;

export async function getOrCreateProjectToken(projectId, uid) {
  try {
    let data = await tokenModel.get(projectId);
    let token;
    if (!data) {
      const passsalt = commons.randStr();
      token = sha("sha1").update(passsalt).digest("hex").substr(0, 20);
      await tokenModel.save({ project_id: projectId, token });
    } else {
      token = data.token;
    }
    return ok(getToken(token, uid));
  } catch (err) {
    return fail(402, errorMessage(err));
  }
}

export async function refreshProjectToken(projectId, uid: number | string) {
  try {
    const data = await tokenModel.get(projectId);
    if (!data || !data.token) {
      return fail(402, "没有查到token信息");
    }
    const passsalt = commons.randStr();
    let token = sha("sha1").update(passsalt).digest("hex").substr(0, 20);
    const result = await tokenModel.up(projectId, token);
    token = getToken(token, uid);
    result.token = token;
    return ok(result);
  } catch (err) {
    return fail(402, errorMessage(err));
  }
}
