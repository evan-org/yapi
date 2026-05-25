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
  avatarRepository,
  storageRepository,
  wikiRepository,
  advancedMockRepository,
  advancedMockCaseRepository,
  mockStatisticsRepository,
  swaggerSyncRepository,
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

test("avatarRepository 可写入、查询与更新", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const uid = 999990;
  const basecode = Buffer.from("ci-avatar-png").toString("base64");

  try {
    const createdId = await avatarRepository.up(uid, basecode, "image/png");
    t.truthy(createdId);

    const found = await avatarRepository.get(uid);
    t.truthy(found);
    t.is(found.type, "image/png");
    t.is(found.basecode, basecode);

    const updatedId = await avatarRepository.up(uid, `${basecode}-v2`, "image/jpeg");
    t.is(updatedId, createdId);

    const afterUpdate = await avatarRepository.get(uid);
    t.is(afterUpdate.type, "image/jpeg");
    t.is(afterUpdate.basecode, `${basecode}-v2`);
  } finally {
    await avatarRepository.del(uid);
    await disconnectPg();
  }
});

test("storageRepository 可写入、读取、更新并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  const key = `ci-storage-${Date.now()}`;

  try {
    const inserted = await storageRepository.save(key, { foo: "bar" }, true);
    t.truthy(inserted._id);

    const loaded = await storageRepository.get(key);
    t.deepEqual(loaded, { foo: "bar" });

    await storageRepository.save(key, { foo: "baz", extra: 1 });
    const updated = await storageRepository.get(key);
    t.deepEqual(updated, { foo: "baz", extra: 1 });
  } finally {
    await storageRepository.del(key);
    await disconnectPg();
  }
});

test("wikiRepository 可写入、查询、更新并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let projectId;
  let groupId;
  let wikiId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-wiki-${Date.now()}`,
      group_desc: "ci",
      uid: 999989,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-wiki-${Date.now()}`,
      group_id: groupId,
      uid: 999989,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await wikiRepository.save({
      project_id: projectId,
      desc: "ci wiki desc",
      markdown: "# wiki",
      username: "ci-user",
      uid: 999989,
      add_time: commons.time(),
      up_time: commons.time(),
      edit_uid: 0,
    });
    wikiId = saved._id;
    t.truthy(wikiId);

    const found = await wikiRepository.get(projectId);
    t.truthy(found);
    t.is(found.desc, "ci wiki desc");

    await wikiRepository.up(wikiId, {
      desc: "ci wiki updated",
      up_time: commons.time(),
    });
    const afterUp = await wikiRepository.get(projectId);
    t.is(afterUp.desc, "ci wiki updated");

    await wikiRepository.upEditUid(wikiId, 999989);
    const afterEdit = await wikiRepository.get(projectId);
    t.is(afterEdit.edit_uid, 999989);
  } finally {
    if (projectId) {
      await wikiRepository.delByProjectId(projectId);
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

test("advancedMockRepository 与 advancedMockCaseRepository 可写入、查询并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let projectId;
  let groupId;
  let interfaceId;
  let caseId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-advmock-${Date.now()}`,
      group_desc: "ci",
      uid: 999988,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-advmock-${Date.now()}`,
      group_id: groupId,
      uid: 999988,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const iface = await interfaceRepository.save({
      title: "ci-adv-mock-iface",
      path: "/ci-adv-mock",
      method: "GET",
      project_id: projectId,
      uid: 999988,
      add_time: commons.time(),
      up_time: commons.time(),
    });
    interfaceId = iface._id;

    const mockRow = await advancedMockRepository.save({
      interface_id: interfaceId,
      project_id: projectId,
      uid: 999988,
      mock_script: "return {}",
      enable: true,
    });
    t.truthy(mockRow._id);

    const mockFound = await advancedMockRepository.get(interfaceId);
    t.is(mockFound.mock_script, "return {}");

    await advancedMockRepository.up({
      interface_id: interfaceId,
      project_id: projectId,
      uid: 999988,
      mock_script: "return { ok: 1 }",
      enable: true,
    });
    const mockUpdated = await advancedMockRepository.get(interfaceId);
    t.is(mockUpdated.mock_script, "return { ok: 1 }");

    const caseRow = await advancedMockCaseRepository.save({
      interface_id: interfaceId,
      project_id: projectId,
      ip_enable: false,
      name: "ci-case",
      params: { q: "1" },
      uid: 999988,
      code: 200,
      delay: 0,
      headers: [{ name: "Content-Type", value: "application/json" }],
      res_body: '{"ok":true}',
      ip: "",
    });
    caseId = caseRow._id;
    t.truthy(caseId);

    const listed = await advancedMockCaseRepository.list(interfaceId);
    t.true(listed.some((row) => row._id === caseId));

    const forMock = await advancedMockCaseRepository.listForMock(interfaceId, {
      ip_enable: false,
    });
    t.true(forMock.some((row) => row._id === caseId));

    await advancedMockCaseRepository.up({
      id: caseId,
      name: "ci-case-updated",
    });
    const caseFound = await advancedMockCaseRepository.get({ _id: caseId });
    t.is(caseFound.name, "ci-case-updated");
  } finally {
    if (caseId) {
      await advancedMockCaseRepository.del(caseId);
    }
    if (interfaceId) {
      await advancedMockCaseRepository.delByInterfaceId(interfaceId);
      await advancedMockRepository.delByInterfaceId(interfaceId);
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

test("mockStatisticsRepository 可写入、统计并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let rowId;
  const groupId = 999987;
  const dateStr = "2099-01-01";

  try {
    const saved = await mockStatisticsRepository.save({
      interface_id: 1,
      project_id: 1,
      group_id: groupId,
      time: commons.time(),
      ip: "127.0.0.1",
      date: dateStr,
    });
    rowId = saved._id;
    t.truthy(rowId);

    const total = await mockStatisticsRepository.getTotalCount();
    t.true(total >= 1);

    const byGroup = await mockStatisticsRepository.countByGroupId(groupId);
    t.true(byGroup >= 1);

    const dayCount = await mockStatisticsRepository.getDayCount(["2098-12-31", dateStr]);
    t.true(dayCount.some((row) => row._id === dateStr));
  } finally {
    if (rowId) {
      await mockStatisticsRepository.del(rowId);
    }
    await disconnectPg();
  }
});

test("swaggerSyncRepository 可写入、查询、更新并删除", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }

  await connectYapiDatabase();
  let projectId;
  let groupId;
  let syncId;

  try {
    const group = await groupRepository.save({
      group_name: `ci-grp-sync-${Date.now()}`,
      group_desc: "ci",
      uid: 999986,
      add_time: commons.time(),
      up_time: commons.time(),
      members: [],
    });
    groupId = group._id;

    const project = await projectRepository.save({
      name: `ci-proj-sync-${Date.now()}`,
      group_id: groupId,
      uid: 999986,
      add_time: commons.time(),
      up_time: commons.time(),
      env: [],
      members: [],
    });
    projectId = project._id;

    const saved = await swaggerSyncRepository.save({
      uid: 999986,
      project_id: projectId,
      is_sync_open: true,
      sync_cron: "0 0 * * *",
      sync_json_url: "https://example.com/swagger.json",
      sync_mode: "merge",
    });
    syncId = saved._id;
    t.truthy(syncId);

    const found = await swaggerSyncRepository.getByProjectId(projectId);
    t.is(found.sync_json_url, "https://example.com/swagger.json");

    await swaggerSyncRepository.upById(syncId, {
      sync_json_url: "https://example.com/v2.json",
    });
    const updated = await swaggerSyncRepository.getByProjectId(projectId);
    t.is(updated.sync_json_url, "https://example.com/v2.json");

    const all = await swaggerSyncRepository.listAll();
    t.true(all.some((row) => row._id === syncId));
  } finally {
    if (projectId) {
      await swaggerSyncRepository.delByProjectId(projectId);
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
