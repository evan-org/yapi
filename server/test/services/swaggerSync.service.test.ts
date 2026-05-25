// @ts-nocheck
/**
 * swaggerSync.service 单元测试
 */
import test from "ava";
import { getSyncModeName } from "../../services/swaggerSync.util.js";

test("getSyncModeName 返回合并模式中文名", (t) => {
  t.is(getSyncModeName("good"), "智能合并");
  t.is(getSyncModeName("normal"), "普通模式");
  t.is(getSyncModeName("merge"), "完全覆盖");
  t.is(getSyncModeName("unknown"), "");
});
