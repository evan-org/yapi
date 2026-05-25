// @ts-nocheck
/**
 * interface.service 单元测试（分类删除参数校验）
 */
import test from "ava";
import interfaceService, {
  buildQueryPathFromUrl,
  applyStatusTagFilter,
  mergeSaveResBody,
} from "../../services/interface.service.js";

test("addCategory 缺少项目 id 返回失败", async (t) => {
  const result = await interfaceService.addCategory({
    name: "测试",
    project_id: null,
    desc: "",
    uid: 1,
    username: "test",
  });
  t.false(result.ok);
  t.is(result.code, 400);
});

test("buildQueryPathFromUrl 解析 path 与 query", (t) => {
  const { query_path } = buildQueryPathFromUrl("/api/user?id=1");
  t.is(query_path.path, "/api/user");
  t.is(query_path.params.length, 1);
  t.is(query_path.params[0].name, "id");
});

test("applyStatusTagFilter 附加 status 与 tag", (t) => {
  const option = applyStatusTagFilter({ project_id: 1 }, "done", ["a", "b"]);
  t.deepEqual(option.status, "done");
  t.deepEqual(option.tag, { $in: ["a", "b"] });
});

test("parseUploadApis 解析分类嵌套列表", (t) => {
  const result = interfaceService.parseUploadApis([{ list: [{ title: "a" }] }]);
  t.true(result.ok);
  t.is(result.data.length, 1);
  t.is(result.data[0].title, "a");
});

test("mergeSaveResBody dataSync=good 时合并 schema 新字段", (t) => {
  const merged = mergeSaveResBody(
    {
      res_body_is_json_schema: true,
      dataSync: "good",
      res_body: '{"type":"object","properties":{"b":{"type":"string"}}}',
    },
    { res_body: '{"type":"object","properties":{"a":{"type":"number"}}}' }
  );
  const parsed = JSON.parse(merged);
  t.is(parsed.type, "object");
  t.truthy(parsed.properties.b);
});

test("mergeSaveResBody 非 good 同步时保留新 res_body", (t) => {
  const body = '{"only":"new"}';
  const merged = mergeSaveResBody(
    { res_body_is_json_schema: true, dataSync: "merge", res_body: body },
    { res_body: '{"old":true}' }
  );
  t.is(merged, body);
});
