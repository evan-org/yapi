// @ts-nocheck
/**
 * interface.validation 单元测试
 */
import test from "ava";
import {
  validateAddCategoryParams,
  validateCategoryId,
  validateInterfaceProjectId,
  validateCustomFieldQuery,
  validateIndexBatchItems,
  validateBatchUploadInput,
  validateInterfaceId,
} from "../../services/interface.validation.js";

test("validateAddCategoryParams 缺少 project_id", (t) => {
  const result = validateAddCategoryParams({ name: "分类A", project_id: null });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.message, "项目id不能为空");
  }
});

test("validateAddCategoryParams 缺少 name", (t) => {
  const result = validateAddCategoryParams({ name: "  ", project_id: 1 });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.message, "名称不能为空");
  }
});

test("validateAddCategoryParams 成功时 trim name", (t) => {
  const result = validateAddCategoryParams({
    name: "  接口分类  ",
    project_id: 10,
  });
  t.true(result.ok);
  if (result.ok) {
    t.is(result.data.name, "接口分类");
    t.is(result.data.project_id, 10);
  }
});

test("validateCategoryId 与 validateInterfaceProjectId", (t) => {
  t.false(validateCategoryId("").ok);
  t.false(validateInterfaceProjectId(undefined).ok);
  t.true(validateCategoryId(5).ok);
});

test("validateCustomFieldQuery 仅允许单键", (t) => {
  t.false(validateCustomFieldQuery({ a: 1, b: 2 }).ok);
  const okResult = validateCustomFieldQuery({ field1: "x" });
  t.true(okResult.ok);
  if (okResult.ok) {
    t.is(okResult.data.fieldName, "field1");
    t.is(okResult.data.fieldValue, "x");
  }
});

test("validateIndexBatchItems 必须为数组", (t) => {
  t.false(validateIndexBatchItems(null).ok);
  t.true(validateIndexBatchItems([{ id: 1 }]).ok);
});

test("validateBatchUploadInput 与 validateInterfaceId", (t) => {
  t.false(validateBatchUploadInput({ project_id: null, raw: {} }).ok);
  t.false(validateBatchUploadInput({ project_id: 1, raw: "" }).ok);
  t.true(
    validateBatchUploadInput({ project_id: 1, raw: { list: [] } }).ok
  );
  t.false(validateInterfaceId("").ok);
  t.true(validateInterfaceId(99).ok);
});
