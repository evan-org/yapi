// @ts-nocheck
/**
 * interfaceCol.service 单元测试（参数校验，不依赖数据库）
 */
import test from "ava";
import interfaceColService from "../../services/interfaceCol.service.js";

test("addCol 缺少 project_id 返回失败", async (t) => {
  const result = await interfaceColService.addCol({
    name: "集合",
    project_id: null,
    desc: "",
    uid: 1,
    username: "test",
  });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "项目id不能为空");
  }
});

test("addCol 缺少 name 返回失败", async (t) => {
  const result = await interfaceColService.addCol({
    name: "",
    project_id: 1,
    desc: "",
    uid: 1,
    username: "test",
  });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "名称不能为空");
  }
});

test("addCase 缺少 interface_id 返回失败", async (t) => {
  const result = await interfaceColService.addCase(
    {
      project_id: 1,
      col_id: 1,
      case_env: "",
      interface_id: null,
      casename: "用例",
    },
    { uid: 1, username: "test" }
  );
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "接口id不能为空");
  }
});
