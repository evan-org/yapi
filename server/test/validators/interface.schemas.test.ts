// @ts-nocheck
/**
 * interface.schemas 单元测试
 */
import test from "ava";
import commons from "../../utils/commons.js";
import {
  buildInterfaceSchemaMap,
  interfaceSchemaMap,
} from "../../validators/interface.schemas.js";

test("buildInterfaceSchemaMap 包含 add/up/save 三套 schema", (t) => {
  const map = buildInterfaceSchemaMap();
  t.truthy(map.add["*project_id"]);
  t.truthy(map.up["*id"]);
  t.truthy(map.save.path);
});

test("interfaceSchemaMap 与 buildInterfaceSchemaMap 结构一致", (t) => {
  t.is(typeof interfaceSchemaMap.add, "object");
  t.is(typeof interfaceSchemaMap.up, "object");
  t.is(typeof interfaceSchemaMap.save, "object");
});

test("interfaceSchemaMap.up 接受 boolean 类型的 schema 开关", (t) => {
  const result = commons.validateParams(interfaceSchemaMap.up, {
    id: 1,
    title: "t",
    path: "/api/x",
    method: "GET",
    req_body_is_json_schema: true,
    res_body_is_json_schema: false,
  });
  t.true(result.valid, result.message);
});
