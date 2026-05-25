// @ts-nocheck
/**
 * Repository 层 PostgreSQL 冒烟（CI 有 PG 时验证 group/project/interface）
 */
import test from "ava";
import {
  groupRepository,
  projectRepository,
  interfaceRepository,
} from "../../repositories/index.js";
import commons from "../../utils/commons.js";
import {
  shouldRunPgCi,
  connectYapiDatabase,
  disconnectPg,
} from "../helpers/pg-ci.js";

test("groupRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
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
    await disconnectPg();
  }
});

test("projectRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const projectName = `ci-project-${Date.now()}`;
  let projectId;
  let groupId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-for-proj-${Date.now()}`,
      group_desc: "ci",
      uid: 999998,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const saved = await projectRepository.save({
      name: projectName,
      group_id: groupId,
      uid: 999998,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = saved._id;
    t.truthy(projectId);

    const found = await projectRepository.getBaseInfo(projectId, "name _id group_id");
    t.truthy(found);
    t.is(found.name, projectName);
    t.is(found.group_id, groupId);
  } finally {
    if (projectId) {
      await projectRepository.del(projectId);
    }
    if (groupId) {
      await groupRepository.del(groupId);
    }
    await disconnectPg();
  }
});

test("interfaceRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const path = `/ci-api-${Date.now()}`;
  let interfaceId;
  let projectId;
  let groupId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-iface-${Date.now()}`,
      group_desc: "ci",
      uid: 999997,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-iface-${Date.now()}`,
      group_id: groupId,
      uid: 999997,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await interfaceRepository.save({
      title: "ci iface",
      path,
      method: "GET",
      project_id: projectId,
      catid: 1,
      uid: 999997,
      add_time: commons.time(),
      up_time: commons.time(),
      query_path: { path, params: [] },
    });
    interfaceId = saved._id;
    t.truthy(interfaceId);

    const found = await interfaceRepository.get(interfaceId);
    t.truthy(found);
    t.is(found.path, path);

    const repeat = await interfaceRepository.checkRepeat(projectId, path, "GET");
    t.is(repeat, 1);
  } finally {
    if (interfaceId) {
      await interfaceRepository.del(interfaceId);
    }
    if (projectId) {
      await projectRepository.del(projectId);
    }
    if (groupId) {
      await groupRepository.del(groupId);
    }
    await disconnectPg();
  }
});
