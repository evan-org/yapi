// @ts-nocheck
/**
 * Repository 层 PostgreSQL 冒烟（CI 有 PG 时验证核心关系型仓储）
 */
import test from "ava";
import {
  groupRepository,
  projectRepository,
  interfaceRepository,
  interfaceCatRepository,
  interfaceColRepository,
  interfaceCaseRepository,
  logRepository,
  tokenRepository,
  followRepository,
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

test("interfaceCatRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const catName = `ci-cat-${Date.now()}`;
  let catId;
  let projectId;
  let groupId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-cat-${Date.now()}`,
      group_desc: "ci",
      uid: 999996,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-cat-${Date.now()}`,
      group_id: groupId,
      uid: 999996,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await interfaceCatRepository.save({
      name: catName,
      project_id: projectId,
      uid: 999996,
      desc: "ci cat",
      add_time: commons.time(),
      up_time: commons.time(),
    });
    catId = saved._id;
    t.truthy(catId);

    const list = await interfaceCatRepository.list(projectId);
    t.true(list.some((c) => c._id === catId && c.name === catName));
  } finally {
    if (catId) {
      await interfaceCatRepository.del(catId);
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

test("interfaceColRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const colName = `ci-col-${Date.now()}`;
  let colId;
  let projectId;
  let groupId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-col-${Date.now()}`,
      group_desc: "ci",
      uid: 999995,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-col-${Date.now()}`,
      group_id: groupId,
      uid: 999995,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await interfaceColRepository.save({
      name: colName,
      project_id: projectId,
      uid: 999995,
      desc: "ci col",
      add_time: commons.time(),
      up_time: commons.time(),
    });
    colId = saved._id;
    t.truthy(colId);

    const found = await interfaceColRepository.get(colId);
    t.truthy(found);
    t.is(found.name, colName);
  } finally {
    if (colId) {
      await interfaceColRepository.del(colId);
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

test("interfaceCaseRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const path = `/ci-case-api-${Date.now()}`;
  let caseId;
  let colId;
  let interfaceId;
  let projectId;
  let groupId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-case-${Date.now()}`,
      group_desc: "ci",
      uid: 999994,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-case-${Date.now()}`,
      group_id: groupId,
      uid: 999994,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const iface = await interfaceRepository.save({
      title: "ci iface for case",
      path,
      method: "GET",
      project_id: projectId,
      catid: 1,
      uid: 999994,
      add_time: commons.time(),
      up_time: commons.time(),
      query_path: { path, params: [] },
    });
    interfaceId = iface._id;

    const col = await interfaceColRepository.save({
      name: `ci-col-case-${Date.now()}`,
      project_id: projectId,
      uid: 999994,
      desc: "",
      add_time: commons.time(),
      up_time: commons.time(),
    });
    colId = col._id;

    const saved = await interfaceCaseRepository.save({
      casename: "ci case",
      col_id: colId,
      interface_id: interfaceId,
      project_id: projectId,
      uid: 999994,
      add_time: commons.time(),
      up_time: commons.time(),
    });
    caseId = saved._id;
    t.truthy(caseId);

    const found = await interfaceCaseRepository.get(caseId);
    t.truthy(found);
    t.is(found.casename, "ci case");

    const list = await interfaceCaseRepository.list(colId);
    t.true(list.some((c) => c._id === caseId));
  } finally {
    if (caseId) {
      await interfaceCaseRepository.del(caseId);
    }
    if (colId) {
      await interfaceColRepository.del(colId);
    }
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

test("logRepository 可写入、分页查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let logId;
  let projectId;
  let groupId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-log-${Date.now()}`,
      group_desc: "ci",
      uid: 999993,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-log-${Date.now()}`,
      group_id: groupId,
      uid: 999993,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await logRepository.save({
      content: "ci log entry",
      type: "project",
      uid: 999993,
      username: "ci-user",
      typeid: projectId,
      data: { type: "wiki" },
    });
    logId = saved._id;
    t.truthy(logId);

    const count = await logRepository.listCount(projectId, "project", "wiki");
    t.true(count >= 1);

    const page = await logRepository.listWithPaging(projectId, "project", 1, 10, "wiki");
    t.true(page.some((row) => row._id === logId));
  } finally {
    if (logId) {
      await logRepository.del(logId);
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

test("tokenRepository 可写入、查询与更新", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let tokenRowId;
  let projectId;
  let groupId;
  const tokenValue = `ci-token-${Date.now()}`;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-token-${Date.now()}`,
      group_desc: "ci",
      uid: 999992,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-token-${Date.now()}`,
      group_id: groupId,
      uid: 999992,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await tokenRepository.save({
      project_id: projectId,
      token: tokenValue,
    });
    tokenRowId = saved._id;
    t.truthy(tokenRowId);

    const found = await tokenRepository.get(projectId);
    t.truthy(found);
    t.is(found.token, tokenValue);

    const byToken = await tokenRepository.findId(tokenValue);
    t.truthy(byToken);
    t.is(byToken.project_id, projectId);

    const updated = await tokenRepository.up(projectId, `${tokenValue}-new`);
    t.is(updated.token, `${tokenValue}-new`);
  } finally {
    if (projectId) {
      await tokenRepository.delByProjectId(projectId);
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

test("followRepository 可写入、查询、更新并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let followId;
  let projectId;
  let groupId;
  const uid = 999991;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-follow-${Date.now()}`,
      group_desc: "ci",
      uid,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-follow-${Date.now()}`,
      group_id: groupId,
      uid,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await followRepository.save({
      uid,
      projectid: projectId,
      projectname: "ci-follow-proj",
      icon: "star",
      color: "#ff0000",
    });
    followId = saved._id;
    t.truthy(followId);

    const repeat = await followRepository.checkProjectRepeat(uid, projectId);
    t.is(repeat, 1);

    const listed = await followRepository.list(uid);
    t.true(listed.some((row) => row._id === followId));

    const byProject = await followRepository.listByProjectId(projectId);
    t.true(byProject.some((row) => row._id === followId));

    await followRepository.updateById(uid, projectId, {
      projectname: "ci-follow-updated",
      color: "#00ff00",
    });
    const afterUpdate = await followRepository.list(uid);
    const updated = afterUpdate.find((row) => row._id === followId);
    t.is(updated.projectname, "ci-follow-updated");
    t.is(updated.color, "#00ff00");
  } finally {
    if (projectId && uid) {
      await followRepository.del(projectId, uid);
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
