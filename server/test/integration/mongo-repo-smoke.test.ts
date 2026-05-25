// @ts-nocheck
/**
 * Repository 层 Mongo 冒烟（CI 有 Mongo 时验证 group 写入/查询/删除）
 */
import test from "ava";
import { groupRepository } from "../../repositories/index.js";
import commons from "../../utils/commons.js";
import {
  shouldRunMongoCi,
  connectYapiDatabase,
  disconnectMongo,
} from "../helpers/mongo-ci.js";

test("groupRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunMongoCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const groupName = `ci-group-${Date.now()}`;
  let groupId;

  try {
    const saved = await groupRepository.save({
      group_name: groupName,
      group_desc: "ci smoke",
      uid: 999999,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = saved._id;
    t.truthy(groupId);

    const found = await groupRepository.getGroupById(groupId);
    t.truthy(found);
    t.is(found.group_name, groupName);
  } finally {
    if (groupId) {
      await groupRepository.del(groupId);
    }
    await disconnectMongo();
  }
});
