// @ts-nocheck
/**
 * interface.service 单元测试（分类删除参数校验）
 */
import test from "ava";
import interfaceService from "../../services/interface.service.js";

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
