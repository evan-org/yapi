// @ts-nocheck
/**
 * 表配置回归：全新开发下业务表应全部为关系型
 */
import test from "ava";
import {
  ALL_COLLECTIONS,
  JSONB_COLLECTIONS,
  RELATIONAL_COLLECTIONS,
} from "../../db/table.js";

test("业务表均为关系型，无整表 JSONB 集合", (t) => {
  t.is(JSONB_COLLECTIONS.length, 0);
  t.is(ALL_COLLECTIONS.length, RELATIONAL_COLLECTIONS.length);
  for (const col of ALL_COLLECTIONS) {
    t.true(
      (RELATIONAL_COLLECTIONS as readonly string[]).includes(col),
      `${col} 应在 RELATIONAL_COLLECTIONS 中`
    );
  }
});
