// @ts-nocheck
/**
 * Wiki 模块：WebSocket 编辑锁
 */
import { ok } from "../service-result.js";
import { repos } from "./shared.js";

const { wikiModel, userModel } = repos;

export async function onWsStart(wikiId: number, currentUid: number) {
  const result = await wikiModel.get(wikiId);
  if (result && result.edit_uid === currentUid) {
    await wikiModel.upEditUid(result._id, 0);
  }
  return ok(null);
}

export async function onWsEnd(wikiId: number) {
  const result = await wikiModel.get(wikiId);
  if (result) {
    await wikiModel.upEditUid(result._id, 0);
  }
  return ok(null);
}

export async function onWsEditor(wikiId: number, currentUid: number) {
  const result = await wikiModel.get(wikiId);
  if (result && result.edit_uid !== 0 && result.edit_uid !== currentUid) {
    const userinfo = await userModel.findById(result.edit_uid);
    return ok({
      errno: result.edit_uid,
      data: { uid: result.edit_uid, username: userinfo?.username },
    });
  }
  if (result) {
    await wikiModel.upEditUid(result._id, currentUid);
  }
  return ok({ errno: 0, data: result });
}
