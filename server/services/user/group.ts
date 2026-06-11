// @ts-nocheck
/**
 * 用户模块：私有分组初始化
 */
import { nowSeconds } from "../../shared/clock.js";
import { repos } from "./shared.js";

const { groupModel } = repos;

export async function createPrivateGroup(uid: number | string) {
  await groupModel.save({
    uid,
    group_name: "User-" + uid,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
    type: "private",
  });
}
