// @ts-nocheck
/**
 * interfaceCol.validation 单元测试
 */
import test from "ava";
import {
  validateAddColParams,
  validateAddCaseParams,
  validateAddCaseListInput,
  validateCloneCaseListInput,
  validateColId,
} from "../../services/interfaceCol.validation.js";

test("validateAddColParams 与 addCol 测试一致", (t) => {
  const failProject = validateAddColParams({ name: "x", project_id: null });
  t.false(failProject.ok);
  if (!failProject.ok) {
    t.is(failProject.message, "项目id不能为空");
  }
  const failName = validateAddColParams({ name: "", project_id: 1 });
  t.false(failName.ok);
  if (!failName.ok) {
    t.is(failName.message, "名称不能为空");
  }
});

test("validateAddCaseParams 缺少 interface_id", (t) => {
  const result = validateAddCaseParams({
    project_id: 1,
    col_id: 1,
    casename: "用例",
    interface_id: null,
  });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.message, "接口id不能为空");
  }
});

test("validateAddCaseListInput 与 validateCloneCaseListInput", (t) => {
  t.false(validateAddCaseListInput({ project_id: 1, col_id: 1 }).ok);
  t.false(
    validateCloneCaseListInput({
      project_id: 1,
      col_id: 1,
      new_col_id: null,
    }).ok
  );
  const colFail = validateColId(0, "col_id不能为空");
  t.false(colFail.ok);
  if (!colFail.ok) {
    t.is(colFail.code, 407);
  }
});
