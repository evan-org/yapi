// @ts-nocheck
/**
 * 用户模块：管理员操作
 */
import { ok, fail } from "../service-result.js";
import { repos, errorMessage, type UserActor } from "./shared.js";

const { userModel } = repos;

export async function remove(id: number | string, actor: UserActor) {
  if (actor.role !== "admin") {
    return fail(402, "Without permission.");
  }
  if (id == actor.currentUid) {
    return fail(403, "禁止删除管理员");
  }
  if (!id) {
    return fail(400, "uid不能为空");
  }
  try {
    const result = await userModel.del(id);
    return ok(result);
  } catch (e) {
    return fail(402, errorMessage(e));
  }
}
