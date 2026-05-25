// @ts-nocheck
/**
 * interface.schemas 单元测试
 */
import test from "ava";
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
